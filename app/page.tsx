import Link from 'next/link';

import { ArrowRight, CheckCircle2, Sparkles, Target, Workflow } from 'lucide-react';

const heroHighlights = [
  'AI-powered resume parsing & optimization',
  'Automated job discovery across 50k+ roles',
  'Human-like application workflows with analytics'
];

const featureCards = [
  {
    title: 'Unified Profile Workspace',
    description:
      'Upload, parse, and curate every aspect of your professional profile. Keep multiple resumes, cover letters, and supporting documents in sync.',
    icon: <Sparkles className="h-6 w-6 text-primary" />
  },
  {
    title: 'Smart Job Matching',
    description:
      'Our semantic matching engine blends skills, experience, and preferences to surface high-signal roles tailored to your goals.',
    icon: <Target className="h-6 w-6 text-primary" />
  },
  {
    title: 'Automated Applications',
    description:
      'Ship custom cover letters, auto-fill complex forms, and monitor every submission from a single command center.',
    icon: <Workflow className="h-6 w-6 text-primary" />
  }
];

const metrics = [
  { label: 'Applications automated', value: '12k+' },
  { label: 'Average time saved per user', value: '8 hrs/week' },
  { label: 'Response uplift', value: '3.5x' }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <header className="border-b border-border/60 bg-white/80 backdrop-blur">
        <div className="container flex items-center justify-between py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
              AF
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">ApplyFlow</p>
              <p className="text-sm text-muted-foreground">Automate applications with confidence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-md px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="container grid gap-10 pb-24 pt-20 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            Built for modern job seekers
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Automate your job search with a personal application co-pilot
          </h1>
          <p className="text-lg text-muted-foreground">
            ApplyFlow unifies profile management, intelligent job discovery, and automated applications into one cohesive
            experience—so you can focus on interviews, not forms.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {heroHighlights.map((item) => (
              <div key={item} className="rounded-xl border border-border/60 bg-white px-4 py-5 text-left shadow-sm">
                <p className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary" /> {item}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
            >
              Create an account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#features" className="text-sm font-semibold text-primary transition hover:text-primary/80">
              Explore the platform
            </Link>
          </div>
        </div>

        <div className="grid gap-6 rounded-3xl border border-border/60 bg-white p-10 shadow-xl" id="features">
          <div className="grid gap-4 text-left sm:grid-cols-3">
            {featureCards.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-slate-50/70 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  {feature.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-4 rounded-2xl bg-gradient-to-r from-primary/90 via-primary to-secondary/80 p-8 text-left text-primary-foreground">
            <h2 className="text-2xl font-semibold">Phase-based roadmap built for scale</h2>
            <p className="max-w-2xl text-sm opacity-95">
              Launch with an MVP that covers authentication, resume parsing, job matching, and application tracking. Gradually
              layer in automation, AI-generated cover letters, campaign orchestration, and analytics as your user base grows.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-xl bg-white/10 p-4 text-sm">
                  <p className="text-lg font-semibold">{metric.value}</p>
                  <p className="text-xs uppercase tracking-wide opacity-80">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-white py-16">
        <div className="container grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Seamless automation with ethical guardrails
            </h2>
            <p className="text-base text-muted-foreground">
              ApplyFlow keeps users in control. Configure review checkpoints, respect platform rate limits, and maintain truthful
              profiles while leveraging automation. Our compliance architecture helps teams stay aligned with legal and ethical
              guidelines across every market.
            </p>
            <div className="grid gap-3">
              {['GDPR & CCPA readiness out of the box', 'Transparent automation history for each application', 'Secure document vault for resumes and cover letters'].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary" /> {item}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-border/60 bg-slate-50/70 p-8">
            <h3 className="text-lg font-semibold text-slate-900">End-to-end automation pipeline</h3>
            <div className="grid gap-4 text-sm text-muted-foreground">
              <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
                <p className="font-semibold text-foreground">1. Capture & enrich resumes</p>
                <p>Parse resumes, augment profiles, and score completeness with guided recommendations.</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
                <p className="font-semibold text-foreground">2. Discover job opportunities</p>
                <p>Scrape major job boards, deduplicate listings, and surface the most relevant roles in real time.</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
                <p className="font-semibold text-foreground">3. Automate applications</p>
                <p>Auto-fill forms, generate tailored cover letters, and monitor application status from one dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-slate-900 py-10 text-sm text-slate-200">
        <div className="container flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} ApplyFlow. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="transition hover:text-white">
              Privacy Policy
            </Link>
            <Link href="#" className="transition hover:text-white">
              Terms of Service
            </Link>
            <Link href="#" className="transition hover:text-white">
              Security
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
