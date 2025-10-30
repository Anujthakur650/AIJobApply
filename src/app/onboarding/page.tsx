import { requireUser } from "@/lib/auth/session";
import {
  computeProfileCompletion,
  getOnboardingProgress,
} from "@/lib/onboarding/service";
import { listResumes } from "@/lib/resumes/service";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const { userId } = await requireUser();
  const [progress, snapshot, resumes] = await Promise.all([
    getOnboardingProgress(userId),
    computeProfileCompletion(userId),
    listResumes(userId),
  ]);

  return (
    <OnboardingWizard
      progress={progress}
      snapshot={snapshot}
      resumes={resumes.map((resume) => ({
        id: resume.id,
        label: resume.label,
        isPrimary: resume.isPrimary,
        createdAt: resume.createdAt.toISOString(),
      }))}
    />
  );
}
