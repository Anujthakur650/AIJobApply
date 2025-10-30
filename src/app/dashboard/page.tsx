import { TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dashboardMetrics, dashboardSummary, activityFeed } from "@/lib/data/mock-data";
import { formatDelta } from "@/lib/utils";

const activityVariants: Record<string, { label: string; variant: "default" | "secondary" | "success" | "muted" }>
  = {
    queued: { label: "Queued", variant: "muted" },
    "in-progress": { label: "In progress", variant: "secondary" },
    submitted: { label: "Submitted", variant: "default" },
    positive: { label: "Positive", variant: "success" },
  };

export default function DashboardPage() {
  return (
    <div className="container space-y-10 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Command center</h1>
          <p className="mt-2 text-muted-foreground">
            Monitor pipeline throughput, application velocity, and human-in-the-loop touchpoints.
          </p>
        </div>
        <Button>Generate weekly briefing</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {dashboardMetrics.map((metric) => (
          <Card key={metric.title} className="border-border/70">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-muted-foreground">{metric.title}</CardTitle>
              <CardDescription>{metric.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <span className="text-3xl font-semibold text-foreground">{metric.value}</span>
              <span
                className="flex items-center gap-1 text-sm text-muted-foreground"
                aria-label={`Trend ${metric.trend} by ${Math.abs(metric.delta)}%`}
              >
                {metric.trend === "up" ? (
                  <TrendingUp className="size-4 text-success" />
                ) : (
                  <TrendingDown className="size-4 text-primary" />
                )}
                {formatDelta(metric.trend === "up" ? metric.delta : -metric.delta)}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pipeline momentum</CardTitle>
              <CardDescription>Track the levers keeping your automation humming.</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View analytics
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {dashboardSummary.map((item) => (
              <div key={item.label} className="rounded-lg border border-dashed border-border/70 p-4">
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                <p className="text-xs text-success">{formatDelta(item.change)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Focus time recovered</CardTitle>
            <CardDescription>
              Automation reclaimed <span className="font-semibold">11.5 hours</span> of admin work this
              week.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• AI cover letters drafted in under 90 seconds on average</p>
              <p>• 6 scheduling sequences initiated across preferred contact channels</p>
              <p>• 12 duplicate job postings collapsed into a single review queue</p>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              View automation log
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Latest activity</CardTitle>
          <CardDescription>What the automation engine shipped in the past 24 hours.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activityFeed.map((item) => {
            const badge = activityVariants[item.status];
            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-lg border border-dashed border-border/70 bg-background/80 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-base font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <div className="flex items-center justify-between gap-3 md:flex-col md:items-end md:justify-center">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                  <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
