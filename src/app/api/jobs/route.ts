import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import {
  refreshJobsForUser,
  searchJobsForUser,
  type JobSearchFilters,
} from "@/lib/jobs/jobService";

const refreshSchema = z.object({
  query: z.string().min(2),
  location: z.string().optional(),
});

const toNumber = (value: string | null) => {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const GET = async (request: NextRequest) => {
  try {
    const { userId } = await requireUser();
    const params = request.nextUrl.searchParams;

    const filters: JobSearchFilters = {
      query: params.get("q") ?? undefined,
      location: params.get("location") ?? undefined,
      employmentType: params.get("type") ?? undefined,
      remoteOnly: params.get("remote") === "true",
      minSalary: toNumber(params.get("minSalary")),
      maxSalary: toNumber(params.get("maxSalary")),
      postedWithinDays: toNumber(params.get("postedWithin")),
      limit: toNumber(params.get("limit")),
      threshold: toNumber(params.get("threshold"))
        ? Number(params.get("threshold")) / 100
        : undefined,
    };

    const jobs = await searchJobsForUser(userId, filters);
    return NextResponse.json({ jobs });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to fetch jobs", error);
    return NextResponse.json({ error: "Unable to load jobs" }, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const payload = await request.json();
    const parsed = refreshSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { userId } = await requireUser();
    const result = await refreshJobsForUser(
      userId,
      parsed.data.query,
      parsed.data.location
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to refresh jobs", error);
    return NextResponse.json(
      { error: "Unable to refresh jobs" },
      { status: 500 }
    );
  }
};
