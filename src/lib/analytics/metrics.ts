import { z } from "zod";

const applicationSchema = z.object({
  id: z.string(),
  status: z.enum([
    "QUEUED",
    "SUBMISSION_IN_PROGRESS",
    "SUBMITTED",
    "CONFIRMED",
    "FAILED",
    "CANCELLED",
    "RESPONDED",
    "ARCHIVED",
  ]),
  appliedAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  responseMetadata: z.record(z.any()).nullable().optional(),
});

const periodSchema = z.object({
  start: z.date(),
  end: z.date(),
});

export type AnalyticsSummary = {
  totals: {
    applications: number;
    submitted: number;
    confirmed: number;
    responses: number;
    failed: number;
  };
  rates: {
    submissionSuccess: number;
    responseRate: number;
    failureRate: number;
  };
  velocity: {
    averagePerDay: number;
    averageResponseTimeHours: number | null;
  };
};

const calculateRate = (numerator: number, denominator: number) => {
  if (denominator === 0) {
    return 0;
  }
  return Number((numerator / denominator).toFixed(3));
};

const hoursBetween = (start: Date, end: Date) =>
  Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));

export const createAnalyticsSummary = (
  rawApplications: unknown[],
  rawPeriod: unknown
): AnalyticsSummary => {
  const applications = rawApplications.map((application) =>
    applicationSchema.parse(application)
  );
  const period = periodSchema.parse(rawPeriod);

  const totals = {
    applications: applications.length,
    submitted: applications.filter((application) => application.status === "SUBMITTED").length,
    confirmed: applications.filter((application) => application.status === "CONFIRMED").length,
    responses: applications.filter((application) => application.status === "RESPONDED").length,
    failed: applications.filter((application) => application.status === "FAILED").length,
  };

  const submissionSuccess = calculateRate(totals.confirmed, totals.submitted);
  const responseRate = calculateRate(totals.responses, totals.submitted);
  const failureRate = calculateRate(totals.failed, totals.applications);

  const days = Math.max(
    1,
    Math.round((period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24))
  );

  const sortedResponses = applications
    .filter((application) => {
      const hasResponseAt =
        application.responseMetadata &&
        typeof application.responseMetadata.responseAt === "string";
      return application.appliedAt instanceof Date && hasResponseAt;
    })
    .map((application) =>
      hoursBetween(
        application.appliedAt as Date,
        new Date(application.responseMetadata?.responseAt as string)
      )
    );

  const averageResponseTimeHours =
    sortedResponses.length > 0
      ? sortedResponses.reduce((acc, hours) => acc + hours, 0) /
        sortedResponses.length
      : null;

  return {
    totals,
    rates: {
      submissionSuccess,
      responseRate,
      failureRate,
    },
    velocity: {
      averagePerDay: Number((totals.applications / days).toFixed(2)),
      averageResponseTimeHours,
    },
  };
};
