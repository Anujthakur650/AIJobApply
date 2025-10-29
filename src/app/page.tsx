type Metric = {
  title: string;
  value: string;
  description: string;
};

const metrics: Metric[] = [
  {
    title: "Automation Success",
    value: "95%",
    description: "Average completion rate for multi-site applications",
  },
  {
    title: "Time Saved",
    value: "70%",
    description: "Reduction in manual job search and form filling",
  },
  {
    title: "Interview Lift",
    value: "50%",
    description: "Increase in interview invitations for active users",
  },
];

const features = [
  {
    title: "Intelligent Scraping",
    description:
      "Distributed Playwright-based collectors with proxy rotation, CAPTCHA solving, and human-like behavior to gather rich job data from top boards.",
  },
  {
    title: "Adaptive Applications",
    description:
      "AI-powered form detection maps resumes, cover letters, and profile insights to multi-step forms, handling uploads and validation effortlessly.",
  },
  {
    title: "AI Matching",
    description:
      "Semantic embeddings, skill taxonomies, and preference scoring produce configurable match thresholds with diversity balancing.",
  },
  {
    title: "Campaign Automation",
    description:
      "Precision campaign orchestration with daily limits, priority queues, and recovery strategies that protect account health.",
  },
  {
    title: "Insights & Signals",
    description:
      "Real-time dashboards, conversion funnels, and predictive analytics track every response, interview, and offer across channels.",
  },
  {
    title: "Enterprise-Grade Compliance",
    description:
      "GDPR, CCPA, SOC2 controls with encryption, consent auditing, and responsible automation guardrails built-in.",
  },
];

const phases = [
  {
    label: "Multi-Site Intelligence",
    description:
      "Integrate LinkedIn, Indeed, Monster, Glassdoor, RemoteOK, and more with resilient scraping and automated submissions.",
  },
  {
    label: "AI-Driven Targeting",
    description:
      "Enrich profiles with resume parsing, skill taxonomies, and semantic matching to prioritize the best-fit roles.",
  },
  {
    label: "Campaign Operations",
    description:
      "Run bulk campaigns with rate limiting, failover, and alerting that mimics premium human recruiters.",
  },
  {
    label: "Content & Conversations",
    description:
      "Generate bespoke cover letters, optimize resumes, and manage responses across email, SMS, and Slack.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-20 lg:px-12">
        <section className="grid gap-12 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
              Production Ready
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-[var(--foreground)] sm:text-5xl">
              AIJobApply automates the entire job search lifecycle with enterprise precision.
            </h1>
            <p className="text-lg leading-relaxed text-[var(--muted)]">
              Launch intelligent campaigns that scour every major job board, generate personalized collateral, and submit applications end-to-end while staying compliant, observable, and secure.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                Explore Platform
              </button>
              <button className="rounded-full border border-blue-200 px-6 py-3 text-sm font-semibold text-[var(--primary)] hover:border-blue-300 hover:bg-blue-50">
                Download Architecture Deck
              </button>
            </div>
          </div>
          <div className="grid gap-4 rounded-3xl bg-white p-8 shadow-lg shadow-blue-100">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
              Results that compound
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.title} className="space-y-2">
                  <p className="text-3xl font-semibold text-[var(--foreground)]">
                    {metric.value}
                  </p>
                  <h3 className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
                    {metric.title}
                  </h3>
                  <p className="text-xs text-slate-500">{metric.description}</p>
                </div>
              ))}
            </div>
            <p className="rounded-xl bg-blue-50 p-4 text-xs leading-relaxed text-[var(--muted)]">
              Campaigns orchestrate scraping, matching, and application tasks through BullMQ-powered queues with Redis-backed rate controls, ensuring sustainable automation across every job destination.
            </p>
          </div>
        </section>

        <section className="grid gap-6">
          <h2 className="text-3xl font-semibold text-[var(--foreground)]">
            Platform Capabilities
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="space-y-3 rounded-2xl border border-blue-100 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100"
              >
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr,1.2fr] lg:items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-[var(--foreground)]">
              Program roadmap for enterprise roll-out
            </h2>
            <p className="text-sm text-slate-600">
              Each phase ships production-grade infrastructure with automation, intelligence, communications, and compliance evolving in concert.
            </p>
          </div>
          <div className="grid gap-4">
            {phases.map((phase) => (
              <div
                key={phase.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-base font-semibold text-[var(--foreground)]">
                  {phase.label}
                </h3>
                <p className="text-sm text-slate-600">{phase.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl bg-[var(--primary)] p-10 text-white">
          <h2 className="text-3xl font-semibold">
            Compliance, security, and observability by design
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="font-semibold uppercase tracking-wide">Protected Data</h3>
              <p className="mt-2 text-sm text-blue-100">
                Role-based access, AES-256 encryption, and audit logging ensure every resume, profile, and application is safeguarded.
              </p>
            </div>
            <div>
              <h3 className="font-semibold uppercase tracking-wide">Responsible Automation</h3>
              <p className="mt-2 text-sm text-blue-100">
                Adjustable thresholds with opt-in reviews maintain relevance quality and respect site policies.
              </p>
            </div>
            <div>
              <h3 className="font-semibold uppercase tracking-wide">Operational Insight</h3>
              <p className="mt-2 text-sm text-blue-100">
                PostHog product analytics, Sentry error capture, and Grafana-ready metrics create a complete monitoring fabric.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
