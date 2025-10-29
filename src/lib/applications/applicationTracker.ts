import type { ApplicationStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type StatusUpdatePayload = {
  applicationId: string;
  status: ApplicationStatus;
  metadata?: Prisma.JsonValue;
};

export const updateApplicationStatus = async ({
  applicationId,
  status,
  metadata,
}: StatusUpdatePayload) => {
  const result = await prisma.jobApplication.update({
    where: { id: applicationId },
    data: {
      status,
      responseMetadata:
        status === "RESPONDED" || status === "CONFIRMED" ? metadata : undefined,
      updatedAt: new Date(),
    },
    include: {
      jobPosting: true,
      campaign: true,
    },
  });

  return result;
};
