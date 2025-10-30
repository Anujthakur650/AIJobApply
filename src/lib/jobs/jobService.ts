import { JobBoard, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { gatherJobs } from "@/lib/scraping/pipeline";
import type { ScrapedJob } from "@/lib/scraping/types";
import { calculateMatch } from "@/lib/matching/jobMatcher";

const BOARD_MAP: Record<string, JobBoard> = {
  linkedin: JobBoard.LINKEDIN,
  "linkedin.jobs": JobBoard.LINKEDIN,
  indeed: JobBoard.INDEED,
  "indeed.com": JobBoard.INDEED,
  glassdoor: JobBoard.GLASSDOOR,
  "glassdoor.com": JobBoard.GLASSDOOR,
};

const mapBoard = (board: string): JobBoard =>
  BOARD_MAP[board.toLowerCase()] ?? JobBoard.OTHER;

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[•*\n,;-]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const parseSalary = (value: unknown) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    const match = value.match(/(\d{2,3})/g);
    if (match && match.length) {
      const [min, max] = match.map((item) => Number(item) * 1000);
      return {
        min: Number.isFinite(min) ? min : undefined,
        max: Number.isFinite(max) ? max : undefined,
        label: value,
      };
    }

    return { label: value };
  }

  if (typeof value === "object") {
    const range = value as { min?: number; max?: number; label?: string };
    return {
      min: typeof range.min === "number" ? range.min : undefined,
      max: typeof range.max === "number" ? range.max : undefined,
      label: range.label ?? null,
    };
  }

  return null;
};

const buildMatchProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: {
        include: { skill: true },
      },
      profile: true,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const preferenceSettings = (user.profile?.preferenceSettings ?? {}) as Record<
    string,
    unknown
  >;
  const exclusionSettings = (user.profile?.exclusionSettings ?? {}) as Record<
    string,
    unknown
  >;

  const preferredLocations = Array.isArray(preferenceSettings?.locations)
    ? (preferenceSettings.locations as string[])
    : [];

  const salaryPreferences = preferenceSettings?.salaryRange as
    | { min?: number; max?: number }
    | undefined;

  const excludedCompanies = Array.isArray(exclusionSettings?.companies)
    ? (exclusionSettings.companies as string[])
    : [];

  const excludedKeywords = Array.isArray(exclusionSettings?.keywords)
    ? (exclusionSettings.keywords as string[])
    : [];

  return {
    skills: user.skills.map((skill) => ({
      name: skill.skill.name,
      proficiency: skill.proficiency ?? undefined,
      yearsExperience: skill.yearsExperience ?? undefined,
    })),
    totalYearsExperience: user.profile?.yearsExperience ?? undefined,
    preferredLocations,
    minimumSalary: salaryPreferences?.min,
    maximumSalary: salaryPreferences?.max,
    remotePreferred: Boolean(preferenceSettings?.remotePreferred),
    excludedCompanies,
    excludedKeywords,
  };
};

const transformJobForMatch = (job: {
  title: string;
  company: string;
  location: string | null;
  salaryRange: Prisma.JsonValue | null;
  requirements: Prisma.JsonValue | null;
  tags: Prisma.JsonValue | null;
  workArrangement: string | null;
  postingDate: Date | null;
}) => {
  const salary = parseSalary(job.salaryRange);
  return {
    title: job.title,
    company: job.company,
    location: job.location,
    salaryMin: salary?.min,
    salaryMax: salary?.max,
    requirements: toStringArray(job.requirements),
    tags: toStringArray(job.tags),
    remote: (job.workArrangement ?? "").toLowerCase().includes("remote"),
    postedAt: job.postingDate ? job.postingDate.toISOString() : undefined,
  };
};

export type JobSearchFilters = {
  query?: string;
  location?: string;
  employmentType?: string;
  remoteOnly?: boolean;
  minSalary?: number;
  maxSalary?: number;
  postedWithinDays?: number;
  limit?: number;
  threshold?: number;
};

export type JobListItem = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salaryRange: Prisma.JsonValue | null;
  employmentType: string | null;
  workArrangement: string | null;
  postingDate: Date | null;
  description: string | null;
  url: string;
  matchScore: number;
  matchBreakdown: Record<string, number>;
  matchReasons: string[];
  passesThreshold: boolean;
};

const applyFilter = (jobs: JobListItem[], filters: JobSearchFilters) => {
  return jobs.filter((job) => {
    if (filters.remoteOnly && !(job.workArrangement ?? "").toLowerCase().includes("remote")) {
      return false;
    }

    if (filters.postedWithinDays && job.postingDate) {
      const ageMs = Date.now() - job.postingDate.getTime();
      const limitMs = filters.postedWithinDays * 86_400_000;
      if (ageMs > limitMs) {
        return false;
      }
    }

    if (filters.minSalary || filters.maxSalary) {
      const salary = parseSalary(job.salaryRange);
      if (salary) {
        if (
          filters.minSalary &&
          salary.min !== undefined &&
          salary.min < filters.minSalary
        ) {
          return false;
        }

        if (
          filters.maxSalary &&
          salary.max !== undefined &&
          salary.max > filters.maxSalary
        ) {
          return false;
        }
      }
    }

    return true;
  });
};

export const searchJobsForUser = async (
  userId: string,
  filters: JobSearchFilters
): Promise<JobListItem[]> => {
  const where: Prisma.JobPostingWhereInput = {
    ...(filters.query
      ? {
          OR: [
            { title: { contains: filters.query, mode: "insensitive" } },
            { description: { contains: filters.query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.location
      ? { location: { contains: filters.location, mode: "insensitive" } }
      : {}),
    ...(filters.employmentType
      ? { employmentType: { equals: filters.employmentType } }
      : {}),
  };

  const jobs = await prisma.jobPosting.findMany({
    where,
    orderBy: { postingDate: "desc" },
    take: filters.limit ?? 50,
  });

  if (!jobs.length) {
    return [];
  }

  const profile = await buildMatchProfile(userId);
  const threshold = filters.threshold ?? 0.6;

  const ranked = jobs.map((job) => {
    const match = calculateMatch({
      userProfile: profile,
      job: transformJobForMatch(job),
      threshold,
    });

    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salaryRange: job.salaryRange,
      employmentType: job.employmentType,
      workArrangement: job.workArrangement,
      postingDate: job.postingDate,
      description: job.description,
      url: job.url,
      matchScore: Math.round(match.score * 100),
      matchBreakdown: match.breakdown,
      matchReasons: match.reasons,
      passesThreshold: match.passesThreshold,
    } satisfies JobListItem;
  });

  return applyFilter(ranked, filters).sort((a, b) => b.matchScore - a.matchScore);
};

export const storeScrapedJobs = async (board: string, jobs: ScrapedJob[]) => {
  if (!jobs.length) {
    return [];
  }

  const jobBoard = mapBoard(board);

  return Promise.all(
    jobs.map((job) =>
      prisma.jobPosting.upsert({
        where: {
          jobBoard_externalId: {
            jobBoard,
            externalId: job.externalId ?? `${job.source}-${job.title}-${job.company}`,
          },
        },
        update: {
          title: job.title,
          company: job.company,
          location: job.location,
          salaryRange: job.salary ? parseSalary(job.salary) : null,
          description: job.description,
          requirements: job.requirements,
          benefits: job.benefits,
          applicationMethod: job.applicationMethod,
          postingDate: job.postedAt ? new Date(job.postedAt) : null,
          workArrangement: job.location?.toLowerCase().includes("remote")
            ? "Remote"
            : job.location,
          scraperMetadata: job.metadata ?? null,
        },
        create: {
          jobBoard,
          externalId: job.externalId ?? `${job.source}-${randomId(job.title)}`,
          url: job.applicationUrl,
          title: job.title,
          company: job.company,
          location: job.location,
          salaryRange: job.salary ? parseSalary(job.salary) : null,
          description: job.description,
          requirements: job.requirements,
          benefits: job.benefits,
          applicationMethod: job.applicationMethod ?? undefined,
          postingDate: job.postedAt ? new Date(job.postedAt) : null,
          workArrangement: job.location?.toLowerCase().includes("remote")
            ? "Remote"
            : job.location,
          scraperMetadata: job.metadata ?? null,
        },
      })
    )
  );
};

const randomId = (value: string) =>
  `${value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

export const refreshJobsForUser = async (
  userId: string,
  query: string,
  location?: string
) => {
  const { jobs, errors } = await gatherJobs(
    {
      query,
      location,
      maxResults: 10,
    },
    {}
  );

  const persisted = await Promise.all(
    jobs.map((job) => storeScrapedJobs(job.source.toLowerCase(), [job]))
  );

  const flatPersisted = persisted.flat();

  const listings = await searchJobsForUser(userId, {
    query,
    location,
    limit: 30,
  });

  return {
    jobs: listings,
    ingested: flatPersisted.length,
    errors,
  };
};
