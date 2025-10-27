import { ApplicationStatus, CampaignStatus } from '@prisma/client';
import { redirect } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusLabels: Record<ApplicationStatus, string> = {
  [ApplicationStatus.QUEUED]: 'Queued',
  [ApplicationStatus.IN_PROGRESS]: 'In progress',
  [ApplicationStatus.SUBMITTED]: 'Submitted',
  [ApplicationStatus.FAILED]: 'Failed',
  [ApplicationStatus.RESPONDED]: 'Response received',
  [ApplicationStatus.INTERVIEW]: 'Interview',
  [ApplicationStatus.OFFER]: 'Offer',
  [ApplicationStatus.HIRED]: 'Hired',
  [ApplicationStatus.ARCHIVED]: 'Archived'
};

const responseStatuses = new Set([
  ApplicationStatus.RESPONDED,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.OFFER,
  ApplicationStatus.HIRED
]);

const pipelineStatuses = [
  ApplicationStatus.QUEUED,
  ApplicationStatus.IN_PROGRESS,
  ApplicationStatus.SUBMITTED
];

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const userId = session.user.id;

  const [groupedApplications, latestApplications, activeCampaigns, profile] = await Promise.all([
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
      take: 8
    }),
    prisma.campaign.count({
      where: {
        userId,
        status: CampaignStatus.ACTIVE
      }
    }),
    prisma.profile.findUnique({ where: { userId } })
  ]);

  const totals = groupedApplications.reduce(
    (acc, entry) => {
      acc.total += entry._count.status;

      if (responseStatuses.has(entry.status)) {
        acc.responses += entry._count.status;
      }

      if (entry.status === ApplicationStatus.INTERVIEW) {
        acc.interviews += entry._count.status;
      }

      if (entry.status === ApplicationStatus.OFFER || entry.status === ApplicationStatus.HIRED) {
        acc.offers += entry._count.status;
      }

      return acc;
    },
    { total: 0, responses: 0, interviews: 0, offers: 0 }
  );

  const pipeline = pipelineStatuses.map((status) => {
    const group = groupedApplications.find((entry) => entry.status === status);
    const value = group?._count.status ?? 0;
    return {
      status,
      value
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Dashboard overview</h1>
        <p className="text-sm text-muted-foreground">
          Monitor your end-to-end job automation pipeline, response rates, and campaign activity in real time.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total applications</CardTitle>
            <CardDescription>All time applications processed through ApplyFlow</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{totals.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Responses</CardTitle>
            <CardDescription>Recruiter replies and status updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{totals.responses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Interviews scheduled</CardTitle>
            <CardDescription>Interviews across all campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{totals.interviews}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active campaigns</CardTitle>
            <CardDescription>Automation sequences currently running</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{activeCampaigns}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Application pipeline</CardTitle>
            <CardDescription>Track throughput across each automation stage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {pipeline.map(({ status, value }) => {
              const percentage = totals.total > 0 ? Math.round((value / totals.total) * 100) : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-muted-foreground">{statusLabels[status]}</span>
                    <span className="text-xs text-muted-foreground">{percentage}%</span>
                  </div>
                  <Progress value={percentage} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile completeness</CardTitle>
            <CardDescription>Boost your match rate by completing your workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-semibold text-foreground">{profile?.profileScore ?? 0}%</p>
              <p className="text-xs text-muted-foreground">Higher completeness unlocks better AI matching and cover letters.</p>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>✓ Add or update your resume documents</p>
              <p>✓ Confirm work history and highlight achievements</p>
              <p>✓ Tag top skills and set location/salary preferences</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest application activity</CardTitle>
          <CardDescription>Recent submissions and responses across your campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {latestApplications.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No applications yet. Build your profile and start an automation campaign to see activity here.
              </p>
            )}
            {latestApplications.map((application) => (
              <div
                key={application.id}
                className="flex flex-col justify-between gap-2 rounded-xl border border-border/70 bg-white/80 p-4 md:flex-row md:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{application.jobPosting.title}</p>
                  <p className="text-xs text-muted-foreground">{application.jobPosting.company}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{statusLabels[application.status]}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {application.appliedAt ? application.appliedAt.toLocaleDateString() : 'Pending submission'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
