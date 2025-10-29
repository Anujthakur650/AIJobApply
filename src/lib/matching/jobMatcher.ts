import { differenceInYears } from "date-fns";
import { z } from "zod";

const weighting = {
  skills: 0.4,
  experience: 0.25,
  location: 0.2,
  salary: 0.15,
};

const userProfileSchema = z.object({
  skills: z.array(z.object({
    name: z.string(),
    proficiency: z.number().min(1).max(5).optional(),
    yearsExperience: z.number().nonnegative().optional(),
  })),
  totalYearsExperience: z.number().nonnegative().optional(),
  preferredLocations: z.array(z.string()).default([]),
  minimumSalary: z.number().optional(),
  maximumSalary: z.number().optional(),
  remotePreferred: z.boolean().default(false),
  excludedCompanies: z.array(z.string()).default([]),
  excludedKeywords: z.array(z.string()).default([]),
});

const jobSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().nullable().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  requirements: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  remote: z.boolean().default(false),
  postedAt: z.string().datetime().optional(),
});

export type MatchInput = {
  userProfile: z.infer<typeof userProfileSchema>;
  job: z.infer<typeof jobSchema>;
  threshold?: number;
};

export type MatchResult = {
  score: number;
  passesThreshold: boolean;
  breakdown: {
    skills: number;
    experience: number;
    location: number;
    salary: number;
  };
  reasons: string[];
};

const normalizeString = (value?: string | null) =>
  value?.toLowerCase().trim() ?? "";

const intersects = (source: string[], target: string[]) => {
  const sourceSet = new Set(source.map(normalizeString));
  return target.some((item) => sourceSet.has(normalizeString(item)));
};

const computeSkillScore = (
  required: string[],
  userSkills: Array<{ name: string; proficiency?: number }>
) => {
  if (!required.length) {
    return 1;
  }

  const userSkillMap = new Map(
    userSkills.map((skill) => [normalizeString(skill.name), skill.proficiency ?? 3])
  );

  const matches = required.filter((skill) => userSkillMap.has(normalizeString(skill)));
  const baseScore = matches.length / required.length;

  if (!matches.length) {
    return 0;
  }

  const proficiencyBoost =
    matches.reduce((acc, skill) => acc + (userSkillMap.get(normalizeString(skill)) ?? 3), 0) /
    (matches.length * 5);

  return Math.min(1, baseScore * 0.7 + proficiencyBoost * 0.3);
};

const computeExperienceScore = (
  totalYearsExperience: number | undefined,
  job: z.infer<typeof jobSchema>
) => {
  if (!totalYearsExperience) {
    return 0.5;
  }

  if (!job.postedAt) {
    return Math.min(1, totalYearsExperience / 10);
  }

  const postingAge = Math.max(
    0,
    differenceInYears(new Date(), new Date(job.postedAt))
  );

  const experienceRatio = Math.min(1, totalYearsExperience / 10);
  const recencyBoost = postingAge <= 0 ? 1 : Math.max(0.7, 1 - postingAge * 0.05);

  return Math.min(1, experienceRatio * 0.8 + recencyBoost * 0.2);
};

const computeLocationScore = (
  preferredLocations: string[],
  jobLocation: string | undefined | null,
  wantsRemote: boolean,
  jobRemote: boolean
) => {
  if (jobRemote && wantsRemote) {
    return 1;
  }

  if (!jobLocation) {
    return wantsRemote ? 0.6 : 0.4;
  }

  if (!preferredLocations.length) {
    return 0.8;
  }

  return intersects(preferredLocations, [jobLocation]) ? 1 : 0.1;
};

const computeSalaryScore = (
  expectedMin: number | undefined,
  expectedMax: number | undefined,
  jobMin: number | undefined,
  jobMax: number | undefined
) => {
  if (!expectedMin && !expectedMax) {
    return 0.8;
  }

  if (!jobMin && !jobMax) {
    return 0.4;
  }

  const meetsMinimum = expectedMin ? (jobMax ?? jobMin ?? 0) >= expectedMin : true;
  const withinMaximum = expectedMax ? (jobMin ?? jobMax ?? expectedMax) <= expectedMax : true;

  if (meetsMinimum && withinMaximum) {
    return 1;
  }

  if (meetsMinimum) {
    return 0.75;
  }

  if (withinMaximum) {
    return 0.5;
  }

  return 0.1;
};

export const calculateMatch = ({
  userProfile: rawProfile,
  job: rawJob,
  threshold = 0.7,
}: MatchInput): MatchResult => {
  const userProfile = userProfileSchema.parse(rawProfile);
  const job = jobSchema.parse(rawJob);

  if (userProfile.excludedCompanies.includes(normalizeString(job.company))) {
    return {
      score: 0,
      passesThreshold: false,
      breakdown: {
        skills: 0,
        experience: 0,
        location: 0,
        salary: 0,
      },
      reasons: ["Company is part of the exclusion list"],
    };
  }

  if (intersects(userProfile.excludedKeywords, [job.title, ...job.requirements, ...job.tags])) {
    return {
      score: 0,
      passesThreshold: false,
      breakdown: {
        skills: 0,
        experience: 0,
        location: 0,
        salary: 0,
      },
      reasons: ["Job contains excluded keywords"],
    };
  }

  const skillScore = computeSkillScore(job.requirements, userProfile.skills);
  const experienceScore = computeExperienceScore(
    userProfile.totalYearsExperience,
    job
  );
  const locationScore = computeLocationScore(
    userProfile.preferredLocations,
    job.location,
    userProfile.remotePreferred,
    job.remote
  );
  const salaryScore = computeSalaryScore(
    userProfile.minimumSalary,
    userProfile.maximumSalary,
    job.salaryMin,
    job.salaryMax
  );

  const weightSum =
    weighting.skills + weighting.experience + weighting.location + weighting.salary;

  const score =
    (skillScore * weighting.skills +
      experienceScore * weighting.experience +
      locationScore * weighting.location +
      salaryScore * weighting.salary) /
    weightSum;

  const passesThreshold = score >= threshold;

  const reasons = [
    `Skill match ${(skillScore * 100).toFixed(0)}%`,
    `Experience ${(experienceScore * 100).toFixed(0)}%`,
    `Location ${(locationScore * 100).toFixed(0)}%`,
    `Salary ${(salaryScore * 100).toFixed(0)}%`,
  ];

  return {
    score,
    passesThreshold,
    breakdown: {
      skills: skillScore,
      experience: experienceScore,
      location: locationScore,
      salary: salaryScore,
    },
    reasons,
  };
};
