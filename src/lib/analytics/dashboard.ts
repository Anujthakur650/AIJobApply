import { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type DashboardMetrics = {
  totals: {
    applications: number;
    submitted: number;
    responses: number;
    failed: number;
  };
  velocity: {
    thisWeek: number;
    lastWeek: number;
  };
  profileCompletion: number;
  resumeCount: number;
  upcomingActions: Array<{
    id: string;
    title: string;
    status: string;
    occurredAt: Date;
  }>;
  recentActivity: Array<{
    id: string;
    message: string;
    occurredAt: Date;
  }>;
};

const startOfWeek = () => {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff));
  start.setUTCHours(0, 0, 0, 0);
  return start;
};

export const getDashboardMetrics = async (userId: string): Promise<DashboardMetrics> => {
  const weekStart = startOfWeek();
  const lastWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekEnd = new Date(weekStart.getTime() - 1);

  const [applications, onboarding, resumes, recentEvents, upcoming] = await prisma.$transaction([
    prisma.jobApplication.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        createdAt: true,
        appliedAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.onboardingProgress.findUnique({
      where: { userId },
      select: { profileCompletion: true },
    }),
    prisma.resume.count({ where: { userId } }),
    prisma.applicationEvent.findMany({
      where: { application: { userId } },
      orderBy: { occurredAt: "desc" },
      take: 10,
    }),
    prisma.jobApplication.findMany({
      where: {
        userId,
        status: {
          in: [ApplicationStatus.QUEUED, ApplicationStatus.SUBMISSION_IN_PROGRESS],
        },
      },
      include: {
        jobPosting: true,
      },
      orderBy: {
        priority: "desc",
      },
      take: 5,
    }),
  ]);

  const totals = {
    applications: applications.length,
    submitted: applications.filter((item) => item.status === ApplicationStatus.SUBMITTED).length,
    responses: applications.filter((item) => item.status === ApplicationStatus.RESPONDED).length,
    failed: applications.filter((item) => item.status === ApplicationStatus.FAILED).length,
  };

  const thisWeek = applications.filter((item) => item.createdAt >= weekStart).length;
  const lastWeek = applications.filter(
    (item) => item.createdAt >= lastWeekStart && item.createdAt <= lastWeekEnd
  ).length;

  const recentActivity = recentEvents.map((event) => ({
    id: event.id,
    message: `${event.type.replace(/_/g, " ")}`,
    occurredAt: event.occurredAt,
  }));

  const upcomingActions = upcoming.map((application) => ({
    id: application.id,
    title: application.jobPosting?.title ?? "Application",
    status: application.status,
    occurredAt: application.appliedAt ?? application.createdAt,
  }));

  return {
    totals,
    velocity: {
      thisWeek,
      lastWeek,
    },
    profileCompletion: onboarding?.profileCompletion ?? 0,
    resumeCount: resumes,
    upcomingActions,
    recentActivity,
  };
};
