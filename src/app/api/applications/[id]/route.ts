import { NextResponse } from "next/server";
import { z } from "zod";
import { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import {
  addApplicationNote,
  getApplication,
  updateApplicationStatus,
} from "@/lib/applications/service";
import { enqueueNotification } from "@/lib/queue/tasks";

const updateSchema = z.object({
  status: z.nativeEnum(ApplicationStatus).optional(),
  note: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const GET = async (
  _request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const { userId } = await requireUser();
    const application = await getApplication(userId, params.id);

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to fetch application", error);
    return NextResponse.json({ error: "Unable to load application" }, { status: 500 });
  }
};

export const PATCH = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const payload = await request.json();
    const parsed = updateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { userId } = await requireUser();

    let notificationTarget: {
      email: string;
      jobTitle?: string | null;
      company?: string | null;
      status?: ApplicationStatus;
    } | null = null;

    if (parsed.data.status) {
      await updateApplicationStatus(
        userId,
        params.id,
        parsed.data.status,
        parsed.data.metadata ?? null
      );

      const enriched = await prisma.jobApplication.findFirst({
        where: { id: params.id, userId },
        include: {
          user: true,
          jobPosting: true,
        },
      });

      if (enriched?.user.email) {
        notificationTarget = {
          email: enriched.user.email,
          jobTitle: enriched.jobPosting?.title,
          company: enriched.jobPosting?.company,
          status: parsed.data.status,
        };
      }
    }

    if (parsed.data.note) {
      await addApplicationNote(userId, params.id, parsed.data.note);
    }

    if (notificationTarget) {
      const statusLabel = notificationTarget.status?.replace(/_/g, " ") ?? "updated";
      const subject = `Application ${statusLabel.toLowerCase()}${
        notificationTarget.jobTitle ? ` • ${notificationTarget.jobTitle}` : ""
      }`;
      const companyLine = notificationTarget.company
        ? `<p style="margin: 8px 0 0; color: #334155;">${notificationTarget.company}</p>`
        : "";

      await enqueueNotification({
        channels: ["email"],
        email: {
          to: notificationTarget.email,
          subject,
          html: `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif; background:#f8fafc; padding:32px;">
              <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 20px 60px rgba(15,23,42,0.08);">
                <h2 style="margin:0 0 12px;color:#0f172a;">Application status updated</h2>
                <p style="margin:0 0 12px;color:#475569;">
                  Your application has been marked as <strong>${statusLabel.toLowerCase()}</strong>.
                </p>
                ${companyLine}
                <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;">Automated notification from AIJobApply.</p>
              </div>
            </body></html>`,
        },
      });
    }

    const application = await getApplication(userId, params.id);
    return NextResponse.json({ application });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to update application", error);
    return NextResponse.json(
      { error: "Unable to update application" },
      { status: 500 }
    );
  }
};
