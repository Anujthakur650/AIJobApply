import { NextResponse } from "next/server";
import { z } from "zod";
import { generateCoverLetter } from "@/lib/content/coverLetterGenerator";

const schema = z.object({
  jobTitle: z.string(),
  company: z.string(),
  jobDescription: z.string(),
  userSummary: z.string(),
  achievements: z.array(z.string()).default([]),
  tone: z.enum(["professional", "enthusiastic", "friendly"]).optional(),
});

export const POST = async (request: Request) => {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const coverLetter = await generateCoverLetter(parsed.data);

  return NextResponse.json(coverLetter);
};
