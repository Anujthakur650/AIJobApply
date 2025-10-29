import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateMatch } from "@/lib/matching/jobMatcher";

const requestSchema = z.object({
  userProfile: z.record(z.any()),
  job: z.record(z.any()),
  threshold: z.number().min(0).max(1).optional(),
});

export const POST = async (request: Request) => {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = calculateMatch(parsed.data);

  return NextResponse.json(result);
};
