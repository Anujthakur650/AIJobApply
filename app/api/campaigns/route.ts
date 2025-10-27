import { ApplicationStatus, CampaignStatus, WorkMode } from '@prisma/client';
import { NextResponse } from 'next/server';

import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { campaignCreateSchema } from '@/lib/validators';

const normalizeValue = (value: string) =>
  value
    .trim()
    .replace(/[-\s]+/g, '_')
    .toUpperCase();

export async function GET() {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaigns = await prisma.campaign.findMany({
      where: { userId: session.user.id },
      include: {
        applications: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formatted = campaigns.map((campaign) => {
      const totals = campaign.applications.length;
      const responses = campaign.applications.filter((application) =>
        [
          ApplicationStatus.RESPONDED,
          ApplicationStatus.INTERVIEW,
          ApplicationStatus.OFFER,
          ApplicationStatus.HIRED
        ].includes(application.status)
      );

      const submitted = campaign.applications.filter((application) =>
        [
          ApplicationStatus.SUBMITTED,
          ApplicationStatus.IN_PROGRESS,
          ApplicationStatus.QUEUED
        ].includes(application.status)
      );

      const statusBreakdown = campaign.applications.reduce<Record<string, number>>((acc, application) => {
        acc[application.status] = (acc[application.status] ?? 0) + 1;
        return acc;
      }, {});

      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        targetTitles: campaign.targetTitles,
        targetLocations: campaign.targetLocations,
        keywords: campaign.keywords,
        dailyLimit: campaign.dailyLimit,
        workModes: campaign.workModes,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        totals,
        responses: responses.length,
        submitted: submitted.length,
        statusBreakdown
      };
    });

    return NextResponse.json({ campaigns: formatted });
  } catch (error) {
    console.error('[CAMPAIGNS_GET]', error);
    return NextResponse.json({ error: 'Unable to load campaigns.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = campaignCreateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
    }

    const workModes = parsed.data.workModes
      .map((mode) => normalizeValue(mode))
      .map((mode) => (WorkMode as Record<string, WorkMode>)[mode])
      .filter((value): value is WorkMode => Boolean(value));

    const campaign = await prisma.campaign.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name,
        targetTitles: parsed.data.targetTitles ?? [],
        targetLocations: parsed.data.targetLocations ?? [],
        keywords: parsed.data.keywords ?? [],
        dailyLimit: parsed.data.dailyLimit ?? 10,
        workModes,
        status: CampaignStatus.DRAFT,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null
      }
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('[CAMPAIGNS_POST]', error);
    return NextResponse.json({ error: 'Unable to create campaign.' }, { status: 500 });
  }
}
