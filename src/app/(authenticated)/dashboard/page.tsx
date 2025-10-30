import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getDashboardMetrics } from "@/lib/analytics/dashboard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const formatNumber = (value: number) => value.toLocaleString();

export default async function DashboardPage() {
  const { userId, session } = await requireUser();
  const metrics = await getDashboardMetrics(userId);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Welcome back, {session.user?.name ?? "there"}
        </h1>
        <p className="text-sm text-slate-500">
          Track the health of your automation pipeline, resume uploads, and application velocity
          from a single control centre.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader title="Applications" description="Total created" />
          <CardContent>
            <p className="text-3xl font-semibold text-[var(--foreground)]">
              {formatNumber(metrics.totals.applications)}
            </p>
            <p className="text-xs text-slate-500">All-time submissions queued or sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Submitted" description="Completed automations" />
          <CardContent>
            <p className="text-3xl font-semibold text-[var(--foreground)]">
              {formatNumber(metrics.totals.submitted)}
            </p>
            <p className="text-xs text-emerald-600">
              {formatNumber(metrics.velocity.thisWeek)} this week ({metrics.velocity.lastWeek} last week)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Responses" description="Employer touch points" />
          <CardContent>
            <p className="text-3xl font-semibold text-[var(--foreground)]">
              {formatNumber(metrics.totals.responses)}
            </p>
            <p className="text-xs text-slate-500">Confirmed interviews or follow-ups</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Failures" description="Action required" />
          <CardContent>
            <p className="text-3xl font-semibold text-red-600">
              {formatNumber(metrics.totals.failed)}
            </p>
            <p className="text-xs text-slate-500">Items needing manual review</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr,0.9fr]">
        <Card>
          <CardHeader
            title="Profile completeness"
            description="Finish onboarding tasks to maximise match quality"
            action={
              <Link href="/onboarding">
                <Button size="sm" variant="secondary">
                  Continue onboarding
                </Button>
              </Link>
            }
          />
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Profile strength</span>
              <span className="font-semibold text-[var(--foreground)]">
                {metrics.profileCompletion}%
              </span>
            </div>
            <Progress value={metrics.profileCompletion} />
            <p className="text-xs text-slate-500">
              Upload resumes, enrich your experience timeline, and configure preferences to boost
              your match rate.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Quick actions"
            description="Launch common workflows without leaving the dashboard"
          />
          <CardContent className="grid gap-3">
            <Link href="/jobs">
              <Button variant="primary" className="w-full justify-between">
                Discover new roles <span aria-hidden>→</span>
              </Button>
            </Link>
            <Link href="/applications">
              <Button variant="secondary" className="w-full justify-between">
                Review application queue <span aria-hidden>→</span>
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" className="w-full justify-between">
                Open analytics hub <span aria-hidden>→</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader title="Upcoming actions" description="Keep momentum across campaigns" />
          <CardContent className="space-y-3">
            {metrics.upcomingActions.length === 0 ? (
              <p className="text-sm text-slate-500">No pending applications. You're in great shape!</p>
            ) : (
              <ul className="space-y-3">
                {metrics.upcomingActions.map((item) => (
                  <li key={item.id} className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        {item.status.replace(/_/g, " ")} · {item.occurredAt.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge tone="info">Queued</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Recent activity" description="Latest automation events" />
          <CardContent className="space-y-3">
            {metrics.recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500">No activity captured yet.</p>
            ) : (
              <ul className="space-y-3">
                {metrics.recentActivity.map((item) => (
                  <li key={item.id} className="rounded-xl border border-slate-200 px-4 py-3">
                    <p className="text-sm font-medium text-[var(--foreground)]">{item.message}</p>
                    <p className="text-xs text-slate-500">{item.occurredAt.toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
