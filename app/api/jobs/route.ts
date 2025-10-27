import { NextResponse } from 'next/server';

import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') ?? undefined;
    const limit = Number.parseInt(searchParams.get('limit') ?? '20', 10);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        preferences: true,
        skills: {
          include: {
            skill: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const jobPostings = await prisma.jobPosting.findMany({
      where: query
        ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { company: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } }
            ]
          }
        : undefined,
      include: {
        skills: {
          include: {
            skill: true
          }
        }
      },
      orderBy: {
        relevanceScore: 'desc'
      },
      take: Math.min(50, limit || 20)
    });

    const userSkillSet = new Set(user.skills.map((item) => item.skill.name.toLowerCase()));
    const preferenceLocations = (user.preferences?.locations ?? []).map((location) => location.toLowerCase());
    const preferredWorkModes = new Set(user.preferences?.workModes ?? []);
    const preferredEmploymentTypes = new Set(user.preferences?.employmentType ?? []);

    const results = jobPostings.map((job) => {
      const jobSkills = job.skills.map((item) => item.skill.name.toLowerCase());
      const matchedSkills = jobSkills.filter((skill) => userSkillSet.has(skill));
      const skillRatio = jobSkills.length > 0 ? matchedSkills.length / jobSkills.length : matchedSkills.length > 0 ? 1 : 0;
      const skillContribution = skillRatio * 50;

      const locationContribution =
        preferenceLocations.length > 0 && job.location
          ? preferenceLocations.some((location) => job.location?.toLowerCase().includes(location))
            ? 10
            : 0
          : 0;

      const workModeContribution = job.workMode && preferredWorkModes.has(job.workMode) ? 10 : 0;
      const employmentContribution =
        job.employmentType && preferredEmploymentTypes.has(job.employmentType) ? 10 : 0;

      const baseline = job.relevanceScore > 0 ? Math.min(20, job.relevanceScore * 0.2) : 0;

      const score = Math.min(100, Math.round(skillContribution + locationContribution + workModeContribution + employmentContribution + baseline));

      return {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        employmentType: job.employmentType,
        workMode: job.workMode,
        salaryRange: job.salaryMin && job.salaryMax ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.currency ?? ''}`.trim() : null,
        source: job.source,
        url: job.url,
        postedAt: job.postedAt,
        description: job.description,
        score,
        matchedSkills,
        totalSkills: jobSkills.length,
        requiredSkills: job.skills.map((item) => ({
          id: item.skillId,
          name: item.skill.name,
          importance: item.importance
        }))
      };
    });

    return NextResponse.json({ jobs: results });
  } catch (error) {
    console.error('[JOBS_GET]', error);
    return NextResponse.json({ error: 'Unable to fetch job matches.' }, { status: 500 });
  }
}
