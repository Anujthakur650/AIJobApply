import { ApplicationStatus, CampaignStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const [applicationsByStatus, latestApplications, activeCampaigns] = await Promise.all([
      prisma.application.groupBy({
        by: ['status'],
        _count: {
          status: true
        },
        where: { userId }
      }),
      prisma.application.findMany({
        where: { userId },
        include: {
          jobPosting: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }),
      prisma.campaign.count({
        where: {
          userId,
          status: CampaignStatus.ACTIVE
        }
      })
    ]);

    const totals = applicationsByStatus.reduce(
      (acc, item) => {
        acc.total += item._count.status;

        switch (item.status) {
          case ApplicationStatus.RESPONDED:
            acc.responses += item._count.status;
            break;
          case ApplicationStatus.INTERVIEW:
            acc.interviews += item._count.status;
            acc.responses += item._count.status;
            break;
          case ApplicationStatus.OFFER:
          case ApplicationStatus.HIRED:
            acc.offers += item._count.status;
            acc.responses += item._count.status;
            break;
          default:
            break;
        }

        return acc;
      },
      { total: 0, responses: 0, interviews: 0, offers: 0 }
    );

    const pipeline = applicationsByStatus
      .filter((entry) =>
        [ApplicationStatus.QUEUED, ApplicationStatus.IN_PROGRESS, ApplicationStatus.SUBMITTED].includes(entry.status)
      )
      .map((entry) => ({
        status: entry.status,
        value: entry._count.status
      }));

    const timeline = latestApplications.map((application) => ({
      id: application.id,
      status: application.status,
      jobTitle: application.jobPosting.title,
      company: application.jobPosting.company,
      createdAt: application.createdAt,
      appliedAt: application.appliedAt,
      responseAt: application.responseAt
    }));

    return NextResponse.json({
      metrics: {
        totalApplications: totals.total,
        responses: totals.responses,
        interviews: totals.interviews,
        offers: totals.offers,
        activeCampaigns
      },
      pipeline,
      timeline
    });
  } catch (error) {
    console.error('[DASHBOARD_OVERVIEW_GET]', error);
    return NextResponse.json({ error: 'Unable to fetch dashboard metrics.' }, { status: 500 });
  }
}
