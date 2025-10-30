import pdfParse from "pdf-parse";
import { extractRawText } from "mammoth";
import { getEnv } from "@/lib/config/env";

export type ResumeFileInput = {
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
};

export type ParsedExperience = {
  company: string;
  title: string;
  summary: string;
  startDate?: string | null;
  endDate?: string | null;
};

export type ParsedEducation = {
  institution: string;
  degree?: string | null;
  field?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  gpa?: string | null;
};

export type ParsedResume = {
  text: string;
  contact: {
    name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedin: string | null;
    github: string | null;
    website: string | null;
  };
  summary: string | null;
  experiences: ParsedExperience[];
  education: ParsedEducation[];
  skills: {
    technical: string[];
    soft: string[];
  };
  certifications: string[];
};

const env = getEnv();

const MAX_FILE_SIZE_BYTES = (env.RESUME_MAX_FILE_SIZE_MB ?? 5) * 1024 * 1024;

const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const phoneRegex = /\+?\d[\d\s().-]{7,}\d/;
const linkedinRegex = /linkedin\.com\/[A-Za-z0-9_\-/]+/i;
const githubRegex = /github\.com\/[A-Za-z0-9_\-/]+/i;
const urlRegex = /https?:\/\/[\w.-]+(?:\.[\w\.-]+)+(?:[\/\w\.-]*)*/i;
const dateRangeRegex = /(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{1,2})\.?[\s/-]*(\d{2,4}))\s?[-–—]\s?(Present|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{1,2})\.?[\s/-]*(\d{2,4})|Present)/i;

const TECHNICAL_KEYWORDS = [
  "javascript",
  "typescript",
  "react",
  "next.js",
  "python",
  "java",
  "node",
  "aws",
  "azure",
  "docker",
  "kubernetes",
  "sql",
  "graphql",
  "c#",
  "c++",
  "git",
  "terraform",
  "ci/cd",
  "ml",
  "ai",
  "data",
  "analytics",
  "cloud",
  "html",
  "css",
  "tailwind",
  "sass",
  "jest",
];

const SOFT_SKILL_KEYWORDS = [
  "leadership",
  "communication",
  "collaboration",
  "teamwork",
  "problem solving",
  "critical thinking",
  "adaptability",
  "creativity",
  "mentoring",
  "stakeholder",
  "management",
  "planning",
  "presentation",
  "negotiation",
  "decision making",
  "empathy",
];

const normalise = (value: string) => value.trim().replace(/\s+/g, " ");

const splitSections = (text: string) => {
  const lines = text
    .split("\n")
    .map((line) => normalise(line))
    .filter((line) => line.length > 0);

  const sections: Record<string, string[]> = {
    header: [],
  };

  let currentSection = "summary";
  sections[currentSection] = [];

  const sectionIdentifiers: Record<string, RegExp> = {
    experience: /(experience|employment|projects)/i,
    education: /(education|academic)/i,
    skills: /(skills|technologies|stack)/i,
    certifications: /(certification|licen[sc]e|awards?)/i,
    summary: /(summary|profile|overview)/i,
  };

  lines.forEach((line, index) => {
    if (index < 3) {
      sections.header.push(line);
    }

    const sectionMatch = Object.entries(sectionIdentifiers).find(([_, regex]) =>
      regex.test(line)
    );

    if (sectionMatch) {
      currentSection = sectionMatch[0];
      sections[currentSection] = [];
      return;
    }

    if (!sections[currentSection]) {
      sections[currentSection] = [];
    }

    sections[currentSection].push(line);
  });

  return sections;
};

const blocksFromSection = (lines: string[]) => {
  const blocks: string[][] = [];
  let current: string[] = [];

  lines.forEach((line) => {
    if (!line.trim()) {
      if (current.length) {
        blocks.push(current);
        current = [];
      }
      return;
    }

    current.push(line);
  });

  if (current.length) {
    blocks.push(current);
  }

  return blocks;
};

const parseExperiences = (lines: string[]): ParsedExperience[] => {
  return blocksFromSection(lines).map((block) => {
    const [firstLine = "", secondLine = ""] = block;
    const joined = block.join(" ");
    const dates = joined.match(dateRangeRegex);

    return {
      title: firstLine,
      company: secondLine || firstLine,
      summary: block.slice(2).join("\n") || joined,
      startDate: dates?.[1] ?? null,
      endDate: dates?.[3] ?? null,
    };
  });
};

const parseEducation = (lines: string[]): ParsedEducation[] => {
  return blocksFromSection(lines).map((block) => {
    const [firstLine = "", secondLine = ""] = block;
    const joined = block.join(" ");
    const dates = joined.match(dateRangeRegex);

    return {
      institution: firstLine,
      degree: secondLine || null,
      field: block[2] ?? null,
      startDate: dates?.[1] ?? null,
      endDate: dates?.[3] ?? null,
      gpa: joined.match(/GPA[:\s]+([0-9.]+)/i)?.[1] ?? null,
    };
  });
};

const dedupe = (values: string[]) => Array.from(new Set(values.map((value) => value.toLowerCase())));

const parseSkills = (lines: string[]) => {
  const joined = lines.join(", ");
  const candidates = joined
    .split(/[.,;\n]/)
    .map((item) => normalise(item).toLowerCase())
    .filter((item) => item.length > 1);

  const technical = new Set<string>();
  const soft = new Set<string>();

  candidates.forEach((candidate) => {
    if (TECHNICAL_KEYWORDS.some((keyword) => candidate.includes(keyword))) {
      technical.add(candidate);
      return;
    }

    if (SOFT_SKILL_KEYWORDS.some((keyword) => candidate.includes(keyword))) {
      soft.add(candidate);
      return;
    }

    if (candidate.length <= 18 && candidate.split(" ").length <= 3) {
      technical.add(candidate);
    }
  });

  return {
    technical: Array.from(technical),
    soft: Array.from(soft),
  };
};

const parseCertifications = (lines: string[]) =>
  dedupe(
    lines.filter((line) =>
      /(certified|certificate|certification|award)/i.test(line)
    )
  );

const contactFromHeader = (lines: string[]) => {
  const joined = lines.join(" ");

  return {
    name: lines[0] ?? null,
    email: joined.match(emailRegex)?.[0] ?? null,
    phone: joined.match(phoneRegex)?.[0] ?? null,
    location: joined.match(/\b[A-Z][a-zA-Z]+,\s?[A-Z]{2,}\b/)?.[0] ?? null,
    linkedin: joined.match(linkedinRegex)?.[0] ?? null,
    github: joined.match(githubRegex)?.[0] ?? null,
    website: joined.match(urlRegex)?.[0] ?? null,
  };
};

const ensureSizeWithinLimit = (buffer: Buffer) => {
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error("RESUME_FILE_TOO_LARGE");
  }
};

const extractText = async ({ buffer, mimeType, fileName }: ResumeFileInput) => {
  ensureSizeWithinLimit(buffer);

  const extension = fileName.split(".").pop()?.toLowerCase();

  if (mimeType === "application/pdf" || extension === "pdf") {
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === "docx"
  ) {
    const result = await extractRawText({ buffer });
    return result.value;
  }

  return buffer.toString("utf-8");
};

export const parseResume = async (
  input: ResumeFileInput
): Promise<ParsedResume> => {
  const text = await extractText(input);
  const cleaned = text.replace(/\r\n/g, "\n");
  const sections = splitSections(cleaned);

  const experiences = parseExperiences(sections.experience ?? []);
  const education = parseEducation(sections.education ?? []);
  const skills = parseSkills(sections.skills ?? []);
  const certifications = parseCertifications(sections.certifications ?? []);

  const summary =
    sections.summary && sections.summary.length
      ? sections.summary.join(" ")
      : null;

  return {
    text: cleaned,
    contact: contactFromHeader(sections.header ?? []),
    summary,
    experiences,
    education,
    skills,
    certifications,
  };
};
