import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { ApplicationStatus } from "@prisma/client";
import { getEnv } from "@/lib/config/env";
import { captureError } from "@/lib/observability/instrumentation";
import { prisma } from "@/lib/db/prisma";
import { updateApplicationStatus } from "@/lib/applications/service";
import { enqueueNotification } from "@/lib/queue/tasks";
import { recordAuditLog } from "@/lib/security/audit";

const globalScope = globalThis as typeof globalThis & {
  __imapClient?: ImapFlow;
  __imapStarted?: boolean;
};

type Classification = {
  label: string;
  status?: ApplicationStatus;
};

const classifyResponse = (subject: string | undefined, body: string | undefined): Classification => {
  const content = `${subject ?? ""} ${body ?? ""}`.toLowerCase();

  if (/interview|schedule|meeting|availability/.test(content)) {
    return { label: "interview", status: ApplicationStatus.CONFIRMED };
  }

  if (/offer|congratulations|compensation/.test(content)) {
    return { label: "offer", status: ApplicationStatus.CONFIRMED };
  }

  if (/rejection|regret|unfortunately|not selected/.test(content)) {
    return { label: "rejected", status: ApplicationStatus.RESPONDED };
  }

  if (/follow up|status|update/.test(content)) {
    return { label: "follow_up", status: ApplicationStatus.RESPONDED };
  }

  return { label: "general", status: ApplicationStatus.RESPONDED };
};

const findUserByRecipient = async (addresses: Array<{ address?: string | null }>) => {
  const candidates = addresses
    .map((item) => item.address?.toLowerCase())
    .filter((item): item is string => Boolean(item));

  if (!candidates.length) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      email: {
        in: candidates,
        mode: "insensitive",
      },
    },
  });
};

const resolveApplication = async (
  userId: string,
  company?: string | null
) => {
  if (!company) {
    return null;
  }

  return prisma.jobApplication.findFirst({
    where: {
      userId,
      jobPosting: {
        company: {
          contains: company,
          mode: "insensitive",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const processMessage = async (sequence: number) => {
  const client = globalScope.__imapClient;

  if (!client) {
    return;
  }

  const lock = await client.getMailboxLock("INBOX");

  try {
    const message = await client.fetchOne(sequence, {
      source: true,
      envelope: true,
    });

    if (!message?.source) {
      return;
    }

    const parsed = await simpleParser(message.source);
    const user = await findUserByRecipient(parsed.to?.value ?? []);

    if (!user) {
      return;
    }

    const classification = classifyResponse(parsed.subject, parsed.text ?? parsed.html ?? undefined);

    const fromCompany = parsed.from?.value?.[0]?.name ?? parsed.from?.value?.[0]?.address ?? null;
    const application = await resolveApplication(user.id, fromCompany);

    const responseRecord = await prisma.applicationResponse.create({
      data: {
        userId: user.id,
        applicationId: application?.id,
        classification: classification.label,
        payload: {
          subject: parsed.subject,
          from: parsed.from?.text,
          to: parsed.to?.text,
        },
      },
    });

    if (application && classification.status) {
      await updateApplicationStatus(user.id, application.id, classification.status, {
        via: "email",
        responseId: responseRecord.id,
      });
    }

    if (user.email) {
      await enqueueNotification({
        channels: ["email"],
        email: {
          to: user.email,
          subject: "New response detected",
          html: `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;padding:24px;background:#f8fafc;">
              <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:28px;box-shadow:0 16px 40px rgba(15,23,42,0.08);">
                <h2 style="margin:0 0 12px;color:#0f172a;">We captured a new application response</h2>
                <p style="margin:0 0 12px;color:#475569;">Classification: <strong>${classification.label}</strong></p>
                <p style="margin:0 0 12px;color:#475569;">Subject: ${parsed.subject ?? "(no subject)"}</p>
                <p style="margin:0 0 12px;color:#94a3b8;font-size:12px;">Reference ID: ${responseRecord.id}</p>
              </div>
            </body></html>`,
        },
      });
    }

    await recordAuditLog({
      userId: user.id,
      action: "email.response_recorded",
      resource: application?.id ?? "email",
      metadata: {
        responseId: responseRecord.id,
        classification: classification.label,
      },
    });
  } catch (error) {
    captureError(error);
  } finally {
    lock.release();
  }
};

export const startImapListener = async () => {
  const env = getEnv();

  if (globalScope.__imapStarted) {
    return;
  }

  if (!env.IMAP_HOST || !env.IMAP_USER || !env.IMAP_PASSWORD) {
    console.warn("Skipping IMAP listener – IMAP credentials are not configured.");
    globalScope.__imapStarted = true;
    return;
  }

  const client = new ImapFlow({
    host: env.IMAP_HOST,
    port: env.IMAP_PORT ?? 993,
    secure: env.IMAP_TLS,
    auth: {
      user: env.IMAP_USER,
      pass: env.IMAP_PASSWORD,
    },
  });

  try {
    await client.connect();
    await client.mailboxOpen("INBOX");

    client.on("mail", async () => {
      const exists = client.mailbox?.exists;
      if (typeof exists === "number" && exists > 0) {
        await processMessage(exists);
      }
    });

    globalScope.__imapClient = client;
    globalScope.__imapStarted = true;
  } catch (error) {
    captureError(error);
  }
};
