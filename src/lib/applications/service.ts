import {
  ApplicationEventType,
  ApplicationStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export const getApplicationQueue = async (userId: string) =>
  prisma.jobApplication.findMany({
    where: { userId },
    include: {
      jobPosting: true,
      events: {
        orderBy: { occurredAt: "desc" },
        take: 5,
      },
    },
    orderBy: [
      { priority: "desc" },
      { createdAt: "desc" },
    ],
  });

export const getApplication = async (userId: string, id: string) =>
  prisma.jobApplication.findFirst({
    where: { id, userId },
    include: {
      jobPosting: true,
      events: {
        orderBy: { occurredAt: "desc" },
      },
    },
  });

export const updateApplicationStatus = async (
  userId: string,
  id: string,
  status: ApplicationStatus,
  metadata?: Prisma.JsonValue
) => {
  const application = await prisma.jobApplication.update({
    where: { id },
    data: {
      status,
      updatedAt: new Date(),
      responseMetadata:
        status === "RESPONDED" ? metadata ?? {} : Prisma.DbNull,
    },
    include: {
      jobPosting: true,
    },
  });

  await prisma.applicationEvent.create({
    data: {
      applicationId: id,
      type: mapStatusToEvent(status),
      payload: metadata ?? null,
    },
  });

  return application;
};

const mapStatusToEvent = (status: ApplicationStatus): ApplicationEventType => {
  switch (status) {
    case "SUBMISSION_IN_PROGRESS":
      return ApplicationEventType.SUBMISSION_STARTED;
    case "SUBMITTED":
      return ApplicationEventType.SUBMISSION_SUCCEEDED;
    case "FAILED":
      return ApplicationEventType.SUBMISSION_FAILED;
    case "RESPONDED":
      return ApplicationEventType.RESPONSE_RECEIVED;
    case "ARCHIVED":
      return ApplicationEventType.STATUS_UPDATED;
    default:
      return ApplicationEventType.STATUS_UPDATED;
  }
};

export const addApplicationNote = async (
  userId: string,
  applicationId: string,
  note: string
) => {
  await prisma.applicationEvent.create({
    data: {
      applicationId,
      type: ApplicationEventType.NOTE_ADDED,
      payload: { note, userId },
    },
  });
};

export const reorderApplications = async (
  userId: string,
  orderedIds: string[]
) => {
  const updates = orderedIds.map((id, index) =>
    prisma.jobApplication.update({
      where: { id, userId },
      data: { priority: orderedIds.length - index },
    })
  );

  await prisma.$transaction(updates);
};
