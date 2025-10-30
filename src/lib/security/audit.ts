import { prisma } from "@/lib/db/prisma";

export type AuditPayload = {
  userId?: string;
  action: string;
  resource?: string;
  metadata?: Record<string, unknown>;
};

export const recordAuditLog = async ({
  userId,
  action,
  resource,
  metadata,
}: AuditPayload) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        metadata: metadata ?? null,
      },
    });
  } catch (error) {
    console.warn("Failed to record audit log", error);
  }
};

export const recordConsent = async (
  userId: string,
  type: string,
  granted: boolean,
  metadata?: Record<string, unknown>,
  recordedBy?: string
) => {
  try {
    await prisma.consentLog.create({
      data: {
        userId,
        type,
        granted,
        metadata: metadata ?? null,
        recordedBy,
      },
    });
  } catch (error) {
    console.warn("Failed to record consent", error);
  }
};
