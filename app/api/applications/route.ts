import { ApplicationStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { applicationCreateSchema } from '@/lib/validators';

const normalizeStatus = (value?: string | null) =>
  value
    ?.trim()
    .replace(/[-\s]+/g, '_')
    .toUpperCase();

export async function GET() {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: { userId: session.user.id },
      include: {
        jobPosting: true,
        campaign: true,
        resume: true,
        events: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      applications: applications.map((application) => ({
        id: application.id,
        status: application.status,
        appliedAt: application.appliedAt,
        responseAt: application.responseAt,
        notes: application.notes,
        job: application.jobPosting,
        campaign: application.campaign,
        resume: application.resume,
        latestEvents: application.events
      }))
    });
  } catch (error) {
    console.error('[APPLICATIONS_GET]', error);
    return NextResponse.json({ error: 'Unable to fetch applications.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = applicationCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
    }

    const statusKey = normalizeStatus(parsed.data.status) ?? ApplicationStatus.QUEUED;
    const status = (ApplicationStatus as Record<string, ApplicationStatus>)[statusKey] ?? ApplicationStatus.QUEUED;

    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        jobPostingId: parsed.data.jobPostingId,
        campaignId: parsed.data.campaignId ?? null,
        resumeDocumentId: parsed.data.resumeDocumentId ?? null,
        status,
        notes: parsed.data.notes ?? null,
        appliedAt:
          status === ApplicationStatus.SUBMITTED ||
          status === ApplicationStatus.IN_PROGRESS ||
          status === ApplicationStatus.RESPONDED ||
          status === ApplicationStatus.INTERVIEW ||
          status === ApplicationStatus.OFFER ||
          status === ApplicationStatus.HIRED
            ? new Date()
            : null
      },
      include: {
        jobPosting: true,
        campaign: true,
        resume: true
      }
    });

    await prisma.applicationEvent.create({
      data: {
        applicationId: application.id,
        status,
        message: parsed.data.notes ?? 'Application created manually.'
      }
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('[APPLICATIONS_POST]', error);
    return NextResponse.json({ error: 'Unable to create application.' }, { status: 500 });
  }
}
