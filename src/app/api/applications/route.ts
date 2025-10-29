import { NextResponse } from "next/server";
import { z } from "zod";
import { ApplicationStatus, SubmissionChannel } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { getApplicationQueue } from "@/lib/applications/service";

const createSchema = z.object({
  jobPostingId: z.string(),
  resumeId: z.string().optional(),
  coverLetterId: z.string().optional(),
  channel: z.nativeEnum(SubmissionChannel).default(SubmissionChannel.AUTO_FORM),
});

export const GET = async () => {
  try {
    const { userId } = await requireUser();
    const applications = await getApplicationQueue(userId);
    return NextResponse.json({ applications });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to load applications", error);
    return NextResponse.json({ error: "Unable to load applications" }, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const payload = await request.json();
    const parsed = createSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { userId } = await requireUser();

    const application = await prisma.jobApplication.create({
      data: {
        userId,
        jobPostingId: parsed.data.jobPostingId,
        resumeId: parsed.data.resumeId,
        coverLetterId: parsed.data.coverLetterId,
        submissionChannel: parsed.data.channel,
        status: ApplicationStatus.QUEUED,
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to create application", error);
    return NextResponse.json(
      { error: "Unable to create application" },
      { status: 500 }
    );
  }
};
