import { NextResponse } from "next/server";
import { z } from "zod";
import { createAnalyticsSummary } from "@/lib/analytics/metrics";

const requestSchema = z.object({
  applications: z.array(z.record(z.any())),
  period: z.object({
    start: z.string(),
    end: z.string(),
  }),
});

export const POST = async (request: Request) => {
  const payload = await request.json();
  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const summary = createAnalyticsSummary(
    parsed.data.applications.map((application) => ({
      ...application,
      appliedAt: application.appliedAt ? new Date(application.appliedAt) : undefined,
      createdAt: new Date(application.createdAt),
      updatedAt: new Date(application.updatedAt),
    })),
    {
      start: new Date(parsed.data.period.start),
      end: new Date(parsed.data.period.end),
    }
  );

  return NextResponse.json(summary);
};
