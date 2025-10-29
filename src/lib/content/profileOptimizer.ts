import { getEnv } from "@/lib/config/env";
import { generateCoverLetter } from "@/lib/content/coverLetterGenerator";

export type ResumeInsight = {
  recommendation: string;
  priority: "high" | "medium" | "low";
};

export type ProfileOptimizationResult = {
  optimizedSummary: string;
  prioritySkills: string[];
  insights: ResumeInsight[];
};

export const generateOptimizationPlan = async (
  resumeText: string,
  targetRole: string
): Promise<ProfileOptimizationResult> => {
  const env = getEnv();
  const achievements = resumeText
    .split("\n")
    .filter((line) => line.includes("%") || line.toLowerCase().includes("increase"))
    .slice(0, 3);

  const coverLetter = await generateCoverLetter({
    jobTitle: targetRole,
    company: "Benchmark Company",
    jobDescription: resumeText.slice(0, 400),
    userSummary: resumeText.slice(0, 200),
    achievements,
  });

  const prioritySkills = Array.from(
    new Set(
      resumeText
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter((item) => item.length > 3)
        .slice(0, 10)
    )
  );

  const insights: ResumeInsight[] = [
    {
      recommendation: "Align your summary with the achievements most relevant to the target role.",
      priority: "high",
    },
    {
      recommendation: env.POSTHOG_API_KEY
        ? "Instrument resume version experiments using PostHog for effectiveness tracking."
        : "Track resume variant performance by tagging cover letter generations.",
      priority: "medium",
    },
  ];

  return {
    optimizedSummary: coverLetter.content.split("\n")[0] ?? "",
    prioritySkills,
    insights,
  };
};
