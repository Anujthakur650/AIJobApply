import { EmploymentType, SkillSeniority, WorkMode } from '@prisma/client';
import { NextResponse } from 'next/server';

import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { profileUpdateSchema } from '@/lib/validators';

type EnumRecord = Record<string, string>;

const normalizeEnumValue = (value: string) =>
  value
    .trim()
    .replace(/[-\s]+/g, '_')
    .toUpperCase();

function mapToEnumValue<T extends EnumRecord>(enumObject: T, value?: string | null) {
  if (!value) {
    return undefined;
  }

  const normalized = normalizeEnumValue(value);
  if (normalized in enumObject) {
    return enumObject[normalized as keyof T];
  }

  return undefined;
}

function mapToEnumArray<T extends EnumRecord>(enumObject: T, values?: string[]) {
  if (!values) {
    return [] as T[keyof T][];
  }

  const mapped = values
    .map((value) => mapToEnumValue(enumObject, value))
    .filter((entry): entry is T[keyof T] => Boolean(entry));

  return Array.from(new Set(mapped));
}

async function calculateProfileScore(userId: string) {
  const [profile, experiencesCount, educationCount, certificationCount, skillCount, documentCount, preferences] =
    await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.experience.count({ where: { userId } }),
      prisma.education.count({ where: { userId } }),
      prisma.certification.count({ where: { userId } }),
      prisma.skillOnUser.count({ where: { userId } }),
      prisma.document.count({ where: { userId } }),
      prisma.jobPreference.findUnique({ where: { userId } })
    ]);

  const weights = {
    profile: 0.3,
    experiences: 0.25,
    education: 0.15,
    skills: 0.2,
    documents: 0.05,
    preferences: 0.05
  } as const;

  let score = 0;

  if (profile) {
    const profileFields = [
      profile.headline,
      profile.summary,
      profile.location,
      profile.phone,
      profile.linkedin,
      profile.portfolio
    ];
    const filled = profileFields.filter((value) => value && value.length > 0).length;
    score += weights.profile * Math.min(1, filled / profileFields.length);
  }

  score += weights.experiences * Math.min(1, experiencesCount / 4);
  score += weights.education * Math.min(1, educationCount / 2);
  score += weights.skills * Math.min(1, skillCount / 10);
  score += weights.documents * Math.min(1, documentCount / 3);

  if (preferences) {
    const segments = [
      preferences.employmentType?.length ?? 0,
      preferences.workModes?.length ?? 0,
      preferences.locations?.length ?? 0,
      preferences.keywords?.length ?? 0
    ];
    const filled = segments.filter((value) => value > 0).length;
    score += weights.preferences * Math.min(1, filled / segments.length);
  }

  return Math.min(100, Math.round(score * 100));
}

export async function GET() {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        preferences: true,
        experiences: {
          orderBy: {
            startDate: 'desc'
          }
        },
        educations: {
          orderBy: {
            startDate: 'desc'
          }
        },
        certifications: true,
        skills: {
          include: {
            skill: true
          }
        },
        documents: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      profile: user.profile,
      preferences: user.preferences,
      experiences: user.experiences,
      educations: user.educations,
      certifications: user.certifications,
      skills: user.skills.map((entry) => ({
        id: entry.skillId,
        name: entry.skill.name,
        category: entry.skill.category,
        seniority: entry.seniority,
        years: entry.years
      })),
      documents: user.documents,
      profileScore: user.profile?.profileScore ?? 0
    });
  } catch (error) {
    console.error('[PROFILE_GET]', error);
    return NextResponse.json({ error: 'Unable to load profile data.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
    }

    const { profile, preferences, experiences, educations, certifications, skills } = parsed.data;
    const userId = session.user.id;

    await prisma.$transaction(async (tx) => {
      if (profile) {
        await tx.profile.upsert({
          where: { userId },
          update: {
            headline: profile.headline ?? null,
            summary: profile.summary ?? null,
            phone: profile.phone ?? null,
            location: profile.location ?? null,
            website: profile.website ?? null,
            linkedin: profile.linkedin ?? null,
            github: profile.github ?? null,
            portfolio: profile.portfolio ?? null,
            yearsOfExperience: profile.yearsOfExperience ?? null
          },
          create: {
            userId,
            headline: profile.headline ?? null,
            summary: profile.summary ?? null,
            phone: profile.phone ?? null,
            location: profile.location ?? null,
            website: profile.website ?? null,
            linkedin: profile.linkedin ?? null,
            github: profile.github ?? null,
            portfolio: profile.portfolio ?? null,
            yearsOfExperience: profile.yearsOfExperience ?? null
          }
        });
      }

      if (preferences) {
        const employmentType = mapToEnumArray(EmploymentType, preferences.employmentType);
        const workModes = mapToEnumArray(WorkMode, preferences.workModes);

        await tx.jobPreference.upsert({
          where: { userId },
          update: {
            employmentType,
            workModes,
            locations: preferences.locations ?? [],
            industries: preferences.industries ?? [],
            companySizes: preferences.companySizes ?? [],
            keywords: preferences.keywords ?? [],
            salaryMin: preferences.salaryMin ?? null,
            salaryMax: preferences.salaryMax ?? null,
            remoteOnly: preferences.remoteOnly ?? false
          },
          create: {
            userId,
            employmentType,
            workModes,
            locations: preferences.locations ?? [],
            industries: preferences.industries ?? [],
            companySizes: preferences.companySizes ?? [],
            keywords: preferences.keywords ?? [],
            salaryMin: preferences.salaryMin ?? null,
            salaryMax: preferences.salaryMax ?? null,
            remoteOnly: preferences.remoteOnly ?? false
          }
        });
      }

      if (Array.isArray(experiences)) {
        await tx.experience.deleteMany({ where: { userId } });

        for (const experience of experiences) {
          await tx.experience.create({
            data: {
              userId,
              company: experience.company,
              title: experience.title,
              startDate: new Date(experience.startDate),
              endDate: experience.endDate ? new Date(experience.endDate) : null,
              current: experience.current ?? false,
              location: experience.location ?? null,
              description: experience.description ?? null,
              achievements: experience.achievements ?? []
            }
          });
        }
      }

      if (Array.isArray(educations)) {
        await tx.education.deleteMany({ where: { userId } });

        for (const education of educations) {
          await tx.education.create({
            data: {
              userId,
              school: education.school,
              degree: education.degree ?? null,
              field: education.field ?? null,
              startDate: education.startDate ? new Date(education.startDate) : null,
              endDate: education.endDate ? new Date(education.endDate) : null,
              grade: null,
              description: education.description ?? null
            }
          });
        }
      }

      if (Array.isArray(certifications)) {
        await tx.certification.deleteMany({ where: { userId } });

        for (const certification of certifications) {
          await tx.certification.create({
            data: {
              userId,
              name: certification.name,
              authority: certification.authority ?? null,
              issuedOn: certification.issuedOn ? new Date(certification.issuedOn) : null,
              expiresOn: certification.expiresOn ? new Date(certification.expiresOn) : null,
              url: certification.url ?? null
            }
          });
        }
      }

      if (Array.isArray(skills)) {
        await tx.skillOnUser.deleteMany({ where: { userId } });

        for (const skill of skills) {
          const name = skill.name.trim();
          if (!name) {
            continue;
          }

          const dbSkill = await tx.skill.upsert({
            where: { name },
            update: skill.category ? { category: skill.category } : {},
            create: {
              name,
              category: skill.category ?? null
            }
          });

          const seniority = mapToEnumValue(SkillSeniority, skill.seniority);

          await tx.skillOnUser.create({
            data: {
              userId,
              skillId: dbSkill.id,
              ...(seniority ? { seniority } : {}),
              years: typeof skill.years === 'number' ? skill.years : null
            }
          });
        }
      }
    });

    const completeness = await calculateProfileScore(userId);

    await prisma.profile.upsert({
      where: { userId },
      update: { profileScore: completeness },
      create: { userId, profileScore: completeness }
    });

    const refreshed = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        preferences: true,
        experiences: {
          orderBy: {
            startDate: 'desc'
          }
        },
        educations: {
          orderBy: {
            startDate: 'desc'
          }
        },
        certifications: true,
        skills: {
          include: {
            skill: true
          }
        },
        documents: true
      }
    });

    return NextResponse.json({
      profile: refreshed?.profile,
      preferences: refreshed?.preferences,
      experiences: refreshed?.experiences ?? [],
      educations: refreshed?.educations ?? [],
      certifications: refreshed?.certifications ?? [],
      skills:
        refreshed?.skills.map((entry) => ({
          id: entry.skillId,
          name: entry.skill.name,
          category: entry.skill.category,
          seniority: entry.seniority,
          years: entry.years
        })) ?? [],
      documents: refreshed?.documents ?? [],
      profileScore: completeness
    });
  } catch (error) {
    console.error('[PROFILE_PATCH]', error);
    return NextResponse.json({ error: 'Unable to update profile.' }, { status: 500 });
  }
}
