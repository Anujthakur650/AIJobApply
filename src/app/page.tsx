import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Clock3,
  MailCheck,
  Sparkle,
  Workflow,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME, DEMO_EMAIL } from "@/lib/constants";

const features = [
  {
    title: "Intelligent job matching",
    description:
      "Blend skills, experience, seniority, and preferences to surface the next best application moves.",
    icon: BrainCircuit,
  },
  {
    title: "Automated submissions",
    description:
      "Pre-fill forms, upload documents, and queue personalized outreach without breaking compliance.",
    icon: Workflow,
  },
  {
    title: "Campaign insights",
    description:
      "Monitor funnel health at a glance—application velocity, response rates, and focus time saved.",
    icon: BarChart3,
  },
];

const highlights = [
  {
    title: "45+ minutes saved per role",
    description: "Templated profiles, resume variants, and guided prompts keep quality high at speed.",
    icon: Clock3,
  },
  {
    title: "Human-in-the-loop ready",
    description:
      "Route approvals, capture notes, and handoff to teammates across recruiting, operations, or mentors.",
    icon: MailCheck,
  },
  {
    title: "Privacy-first guardrails",
    description:
      "No credentials stored by default. Bring your own integrations when you are ready to scale.",
    icon: Sparkle,
  },
];

export default function HomePage() {
  return (
    <div className="container space-y-16 pb-16 pt-12 md:pt-16">
      <section className="grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-center">
        <div className="space-y-6">
          <Badge variant="secondary" className="uppercase tracking-wide">
            Preview build
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {APP_NAME} automates the job search so you can focus on conversations.
          </h1>
          <p className="text-lg text-muted-foreground">
            Spin up campaigns across the boards you care about, receive curated matches, and launch
            compliant applications in minutes. This preview showcases the navigation, dashboards, and
            flows that anchor the experience.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/auth">
                Explore the demo <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/dashboard">View dashboard</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Use credentials <span className="font-semibold">{DEMO_EMAIL}</span> /
            <span className="font-semibold"> password123</span> to access the interactive areas.
          </p>
        </div>
        <Card className="border-primary/20 bg-card/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Weekly impact overview <Sparkle className="size-5 text-primary" />
            </CardTitle>
            <CardDescription>
              A glimpse into how the automation engine keeps you informed and in control.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between rounded-lg bg-primary/10 px-4 py-3">
                <span className="text-sm font-medium text-primary">Applications queued</span>
                <span className="text-xl font-semibold text-primary">18</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary/10 px-4 py-3">
                <span className="text-sm font-medium text-secondary-foreground">
                  Roles flagged as high match
                </span>
                <span className="text-xl font-semibold text-secondary-foreground">12</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Response velocity improvement
                </span>
                <span className="text-xl font-semibold text-foreground">+36%</span>
              </div>
            </div>
            <div className="rounded-lg border border-dashed border-primary/30 bg-background p-4 text-sm">
              <p className="font-semibold text-primary">What is live in this preview?</p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li>• Navigation across dashboards, jobs, applications, and settings</li>
                <li>• Auth flows powered by NextAuth with demo credentials</li>
                <li>• Mocked activity feeds, status chips, and relevance scoring</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-10">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">What you can explore</h2>
          <p className="mt-2 text-base text-muted-foreground">
            Each page in this preview highlights how candidates orchestrate their pipeline—from
            discovery to submission—while staying informed via activity feeds and metrics.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="h-full border-border/60">
              <CardHeader className="space-y-3">
                <feature.icon className="size-9 rounded-md bg-primary/10 p-2 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-border/70 bg-gradient-to-r from-primary/10 via-background to-secondary/10 p-8 md:grid-cols-3">
        {highlights.map((highlight) => (
          <Card key={highlight.title} className="h-full border-none bg-transparent shadow-none">
            <CardHeader className="space-y-3 p-0">
              <highlight.icon className="size-10 text-primary" />
              <CardTitle className="text-xl">{highlight.title}</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {highlight.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
        <Card className="flex h-full flex-col justify-between border-none bg-background/80 shadow-sm">
          <CardHeader>
            <CardTitle>Ready to test the flow?</CardTitle>
            <CardDescription>
              Sign in with the demo credentials, navigate to the dashboard, and inspect how the mock
              data renders across pages.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-0">
            <Button asChild>
              <Link href="/auth">Launch auth</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="https://vercel.com" target="_blank" rel="noreferrer">
                View deployment guidance
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
