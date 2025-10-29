import { randomUUID } from "crypto";
import type { ResumeFileType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { uploadDocument } from "@/lib/files/storage";
import { updateOnboardingProgress, updateProfileCompletion } from "@/lib/onboarding/service";
import { parseResume, type ParsedResume, type ResumeFileInput } from "@/lib/resumes/parser";

const determineFileType = (fileName: string): ResumeFileType => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "pdf":
      return "PDF";
    case "docx":
      return "DOCX";
    case "doc":
      return "DOC";
    case "txt":
      return "TXT";
    default:
      return "OTHER";
  }
};

const safeUpload = async (key: string, file: ResumeFileInput) => {
  try {
    await uploadDocument({
      key,
      body: file.buffer,
      contentType: file.mimeType ?? "application/octet-stream",
    });
    return key;
  } catch (error) {
    console.warn("Falling back to inline resume storage", error);
    return `inline://${key}`;
  }
};

export type SaveResumeOptions = {
  userId: string;
  file: ResumeFileInput;
  resumeId?: string;
  label?: string;
  tags?: string[];
  isPrimary?: boolean;
};

export const saveResume = async (
  options: SaveResumeOptions
): Promise<{ resumeId: string; parsed: ParsedResume }> => {
  const { userId, file } = options;
  const parsed = await parseResume(file);
  const fileType = determineFileType(file.fileName);
  const storageKey = await safeUpload(
    `resumes/${userId}/${Date.now()}-${randomUUID()}-${file.fileName}`,
    file
  );

  const { resumeId, isPrimary } = await prisma.$transaction(async (tx) => {
    let existing = options.resumeId
      ? await tx.resume.findFirst({
          where: {
            id: options.resumeId,
            userId,
          },
        })
      : null;

    if (!existing && options.label) {
      existing = await tx.resume.findFirst({
        where: {
          userId,
          label: options.label,
        },
      });
    }

    if (!existing) {
      const resume = await tx.resume.create({
        data: {
          userId,
          label:
            options.label ??
            `Resume ${new Date().toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
            })}`,
          storageKey,
          fileType,
          metadata: parsed,
          tags: options.tags ?? null,
          isPrimary: options.isPrimary ?? true,
        },
      });

      await tx.resumeVersion.create({
        data: {
          resumeId: resume.id,
          version: 1,
          storageKey,
          metadata: parsed,
        },
      });

      if (resume.isPrimary) {
        await tx.resume.updateMany({
          where: {
            userId,
            id: { not: resume.id },
          },
          data: { isPrimary: false },
        });
      }

      return { resumeId: resume.id, isPrimary: resume.isPrimary };
    }

    const lastVersion = await tx.resumeVersion.findFirst({
      where: { resumeId: existing.id },
      orderBy: { version: "desc" },
      select: { version: true },
    });

    const tags = options.tags ?? (existing.tags as string[] | null) ?? null;
    const targetPrimary = options.isPrimary ?? existing.isPrimary;

    const updated = await tx.resume.update({
      where: { id: existing.id },
      data: {
        storageKey,
        fileType,
        metadata: parsed,
        tags,
        isPrimary: targetPrimary,
        label: options.label ?? existing.label,
      },
    });

    await tx.resumeVersion.create({
      data: {
        resumeId: existing.id,
        version: (lastVersion?.version ?? 0) + 1,
        storageKey,
        metadata: parsed,
      },
    });

    if (targetPrimary) {
      await tx.resume.updateMany({
        where: {
          userId,
          id: { not: existing.id },
        },
        data: { isPrimary: false },
      });
    }

    return { resumeId: updated.id, isPrimary: targetPrimary };
  });

  if (isPrimary) {
    await updateOnboardingProgress(userId, { resumeId });
  }

  await updateProfileCompletion(userId);

  return { resumeId, parsed };
};

export const listResumes = async (userId: string) =>
  prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

export const markPrimaryResume = async (userId: string, resumeId: string) => {
  await prisma.$transaction(async (tx) => {
    const resume = await tx.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new Error("RESUME_NOT_FOUND");
    }

    await tx.resume.updateMany({
      where: { userId },
      data: { isPrimary: false },
    });

    await tx.resume.update({
      where: { id: resumeId },
      data: { isPrimary: true },
    });
  });

  await updateOnboardingProgress(userId, { resumeId });
  await updateProfileCompletion(userId);
};

export const deleteResume = async (userId: string, resumeId: string) => {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });

  if (!resume) {
    throw new Error("RESUME_NOT_FOUND");
  }

  await prisma.resume.delete({ where: { id: resumeId } });

  if (resume.isPrimary) {
    const nextPrimary = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const nextResumeId = nextPrimary?.id ?? null;

    if (nextPrimary) {
      await prisma.resume.update({
        where: { id: nextPrimary.id },
        data: { isPrimary: true },
      });
    }

    await updateOnboardingProgress(userId, { resumeId: nextResumeId });
  }

  await updateProfileCompletion(userId);
};

export const updateResumeTags = async (
  userId: string,
  resumeId: string,
  tags: string[]
) => {
  await prisma.resume.update({
    where: { id: resumeId, userId },
    data: { tags },
  });
};
