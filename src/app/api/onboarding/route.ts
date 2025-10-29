import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import {
  computeProfileCompletion,
  getOnboardingProgress,
  updateOnboardingProgress,
  updateProfileCompletion,
} from "@/lib/onboarding/service";
import { listResumes } from "@/lib/resumes/service";

const updateSchema = z.object({
  step: z.number().int().min(1).max(4).optional(),
  completedSteps: z.array(z.number().int()).optional(),
  preferences: z.record(z.any()).optional(),
  resumeId: z.string().nullable().optional(),
});

export const GET = async () => {
  try {
    const { userId } = await requireUser();
    const [progress, snapshot, resumes] = await Promise.all([
      getOnboardingProgress(userId),
      computeProfileCompletion(userId),
      listResumes(userId),
    ]);

    return NextResponse.json({
      progress,
      snapshot,
      resumes,
    });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to fetch onboarding progress", error);
    return NextResponse.json({ error: "Unable to load onboarding" }, { status: 500 });
  }
};

export const PATCH = async (request: Request) => {
  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { userId } = await requireUser();

    if (parsed.data.preferences) {
      await prisma.userProfile.updateMany({
        where: { userId },
        data: {
          preferenceSettings: parsed.data.preferences,
        },
      });
    }

    const onboarding = await updateOnboardingProgress(userId, parsed.data);
    const snapshot = await updateProfileCompletion(userId);

    return NextResponse.json({
      progress: onboarding,
      snapshot,
    });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to update onboarding", error);
    return NextResponse.json(
      { error: "Unable to update onboarding" },
      { status: 500 }
    );
  }
};
