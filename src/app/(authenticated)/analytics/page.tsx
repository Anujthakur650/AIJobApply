import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { getDashboardMetrics } from "@/lib/analytics/dashboard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import QueueStatusPanel from "@/components/queue/QueueStatusPanel";

const getWeekKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const week = Math.ceil((((date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 1)) / 86400000) + new Date(Date.UTC(date.getUTCFullYear(), 0, 1)).getUTCDay() + 1) / 7);
  return `${year}-W${week.toString().padStart(2, '0')}`;
};

export default async function AnalyticsPage() {
  const { userId } = await requireUser();
  const metrics = await getDashboardMetrics(userId);

  const sixWeeksAgo = new Date(Date.now() - 6 * 7 * 24 * 60 * 60 * 1000);

  const [statusBuckets, weeklyApplications] = await prisma.$transaction([
    prisma.jobApplication.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { userId },
    }),
    prisma.jobApplication.findMany({
      where: { userId, createdAt: { gte: sixWeeksAgo } },
      select: { createdAt: true },
    }),
  ]);

  const weeklyCounts = new Map<string, number>();
  weeklyApplications.forEach((item) => {
    const key = getWeekKey(item.createdAt);
    weeklyCounts.set(key, (weeklyCounts.get(key) ?? 0) + 1);
  });

  const weekKeys = Array.from(weeklyCounts.keys()).sort();
  const maxWeekly = weekKeys.reduce((max, key) => Math.max(max, weeklyCounts.get(key) ?? 0), 1);

  const statusTotal = statusBuckets.reduce((acc, bucket) => acc + bucket._count.status, 0) || 1;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Analytics</h1>
        <p className="text-sm text-slate-500">
          Monitor throughput, understand funnel performance, and export data for downstream reporting.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader title="Response rate" description="Confirmed employer touchpoints" />
          <CardContent>
            <p className="text-3xl font-semibold text-[var(--foreground)]">
              {metrics.totals.submitted === 0
                ? '0%'
                : `${Math.round((metrics.totals.responses / metrics.totals.submitted) * 100)}%`}
            </p>
            <p className="text-xs text-slate-500">Based on submitted applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="This week" description="Applications created" />
          <CardContent>
            <p className="text-3xl font-semibold text-[var(--foreground)]">{metrics.velocity.thisWeek}</p>
            <p className="text-xs text-slate-500">Last week {metrics.velocity.lastWeek}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Resume coverage" description="Active resumes uploaded" />
          <CardContent>
            <p className="text-3xl font-semibold text-[var(--foreground)]">{metrics.resumeCount}</p>
            <p className="text-xs text-slate-500">Primary resume powers auto-fill profiles</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <Card>
          <CardHeader title="Weekly application volume" description="Past six weeks" />
          <CardContent>
            {weekKeys.length === 0 ? (
              <p className="text-sm text-slate-500">No applications recorded yet.</p>
            ) : (
              <div className="flex items-end gap-4">
                {weekKeys.map((key) => {
                  const value = weeklyCounts.get(key) ?? 0;
                  const height = Math.max(8, Math.round((value / maxWeekly) * 140));
                  return (
                    <div key={key} className="flex flex-col items-center gap-2">
                      <div
                        style={{ height: `${height}px` }}
                        className="w-10 rounded-t-xl bg-gradient-to-br from-[var(--primary)] to-blue-400"
                        title={`${key}: ${value} applications`}
                      />
                      <span className="text-xs text-slate-500">{key.replace(/^\d{4}-/, '')}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Status distribution" description="Current pipeline" />
          <CardContent className="space-y-3">
            {statusBuckets.map((bucket) => {
              const percent = Math.round((bucket._count.status / statusTotal) * 100);
              return (
                <div key={bucket.status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{bucket.status.replace(/_/g, ' ')}</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-[var(--primary)]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr,0.9fr]">
        <Card>
          <CardHeader
            title="Export data"
            description="Download a CSV snapshot of your application pipeline"
            action={
              <Button asChild size="sm" variant="secondary">
                <Link href="/api/analytics/export?format=csv">Download CSV</Link>
              </Button>
            }
          />
          <CardContent className="space-y-3 text-sm text-slate-500">
            <p>
              Use the exported CSV file to share progress with stakeholders, ingest data into BI tools,
              or archive historical performance for compliance.
            </p>
            <Badge tone="info">SOC2 ready</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Automation insights" description="Latest system signals" />
          <CardContent className="space-y-2">
            <p className="text-sm text-slate-600">
              Queue health: <strong>{metrics.upcomingActions.length <= 5 ? 'Stable' : 'Monitoring'}</strong>
            </p>
            <p className="text-sm text-slate-600">
              Notifications delivered: <strong>{metrics.recentActivity.length}</strong> in the last 10 events
            </p>
            <p className="text-xs text-slate-500">
              BullMQ workers automatically retry failures with exponential backoff and are routed through a
              proxy-aware Playwright client for resilient scraping.
            </p>
          </CardContent>
        </Card>
      </section>

      <QueueStatusPanel />
    </div>
  );
}
