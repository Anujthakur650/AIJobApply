import { prisma } from "@/lib/db/prisma";

export type OnboardingStep = 1 | 2 | 3 | 4;

export type CompletionBreakdown = {
  account: number;
  resume: number;
  profile: number;
  preferences: number;
};

export type OnboardingSnapshot = {
  score: number;
  breakdown: CompletionBreakdown;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export const computeProfileCompletion = async (
  userId: string
): Promise<OnboardingSnapshot> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      resumes: true,
      skills: true,
      profile: {
        include: {
          experiences: true,
          education: true,
        },
      },
      onboarding: true,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const resumeScore = clamp(user.resumes.length > 0 ? 1 : 0);
  const accountScore = clamp(user.emailVerified ? 1 : 0.4);

  const profile = user.profile;

  const headlineScore = profile?.headline ? 1 : 0;
  const summaryScore = profile?.summary ? 1 : 0;
  const experienceScore = clamp((profile?.experiences.length ?? 0) / 3);
  const educationScore = clamp((profile?.education.length ?? 0) / 2);
  const skillsScore = clamp(user.skills.length / 10);

  const profileScore = clamp(
    headlineScore * 0.15 +
      summaryScore * 0.15 +
      experienceScore * 0.35 +
      educationScore * 0.15 +
      skillsScore * 0.2
  );

  const preferencesScore = clamp(
    profile?.preferenceSettings ? 1 : profile?.objectiveSettings ? 0.5 : 0
  );

  const breakdown: CompletionBreakdown = {
    account: accountScore,
    resume: resumeScore,
    profile: profileScore,
    preferences: preferencesScore,
  };

  const score = Math.round(
    (breakdown.account * 0.2 +
      breakdown.resume * 0.3 +
      breakdown.profile * 0.3 +
      breakdown.preferences * 0.2) *
      100
  );

  return {
    score,
    breakdown,
  };
};

export const updateProfileCompletion = async (userId: string) => {
  const snapshot = await computeProfileCompletion(userId);

  await prisma.$transaction([
    prisma.onboardingProgress.upsert({
      where: { userId },
      update: { profileCompletion: snapshot.score },
      create: {
        userId,
        profileCompletion: snapshot.score,
      },
    }),
    prisma.userProfile.updateMany({
      where: { userId },
      data: { strengthScore: snapshot.score },
    }),
  ]);

  return snapshot;
};

export type OnboardingUpdate = {
  step?: OnboardingStep;
  completedSteps?: number[];
  preferences?: Record<string, unknown>;
  resumeId?: string | null;
};

export const updateOnboardingProgress = async (
  userId: string,
  update: OnboardingUpdate
) => {
  const payload: Record<string, unknown> = {};

  if (update.step) {
    payload.currentStep = update.step;
  }

  if (update.completedSteps) {
    payload.completedSteps = update.completedSteps;
  }

  if (typeof update.resumeId !== "undefined") {
    payload.resumeId = update.resumeId;
  }

  if (update.preferences) {
    payload.preferences = update.preferences;
  }

  const onboarding = await prisma.onboardingProgress.upsert({
    where: { userId },
    update: payload,
    create: {
      userId,
      currentStep: update.step ?? 1,
      completedSteps: update.completedSteps ?? [],
      preferences: update.preferences ?? null,
      resumeId: update.resumeId,
    },
  });

  return onboarding;
};

export const getOnboardingProgress = async (userId: string) => {
  const onboarding = await prisma.onboardingProgress.findUnique({
    where: { userId },
  });

  if (!onboarding) {
    return prisma.onboardingProgress.create({
      data: { userId },
    });
  }

  return onboarding;
};
