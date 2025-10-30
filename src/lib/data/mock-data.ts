export const dashboardMetrics = [
  {
    title: "Active campaigns",
    value: 6,
    delta: 12,
    trend: "up" as const,
    description: "Outbound and inbound job hunts currently running",
  },
  {
    title: "Applications queued",
    value: 18,
    delta: 5,
    trend: "up" as const,
    description: "Awaiting review before automated submission",
  },
  {
    title: "Average match score",
    value: 87,
    delta: 2,
    trend: "down" as const,
    description: "Composite of skill, seniority, and cultural fit",
  },
];

export const dashboardSummary = [
  {
    label: "Interviews booked",
    value: 3,
    change: 40,
  },
  {
    label: "Follow-ups sent",
    value: 11,
    change: 22,
  },
  {
    label: "Documents refreshed",
    value: 7,
    change: 12,
  },
];

export const activityFeed = [
  {
    id: "1",
    title: "Cover letter personalized",
    description: "Adaptive tone adjusted for lead product designer role at Particle Labs.",
    timestamp: "5 minutes ago",
    status: "in-progress" as const,
  },
  {
    id: "2",
    title: "Application submitted",
    description: "Senior Product Engineer at Northstar Automation",
    timestamp: "41 minutes ago",
    status: "submitted" as const,
  },
  {
    id: "3",
    title: "Recruiter replied",
    description: "Intro call scheduled with Brightwave HR — 10:30am Thursday.",
    timestamp: "2 hours ago",
    status: "positive" as const,
  },
  {
    id: "4",
    title: "Job imported",
    description: "Growth Engineer role at Atlas — flagged for high cultural fit.",
    timestamp: "Yesterday",
    status: "queued" as const,
  },
];

export const jobFilters = {
  types: ["Full-time", "Contract", "Freelance", "Part-time"],
  locations: ["Remote", "Hybrid", "Onsite"],
  experience: ["Junior", "Mid", "Senior", "Lead"],
};

export const jobListings = [
  {
    id: "job-1",
    title: "Product Engineer",
    company: "Northstar Automation",
    location: "Remote · North America",
    type: "Full-time",
    tags: ["TypeScript", "Next.js", "Design Systems"],
    relevanceScore: 94,
    posted: "2 days ago",
    summary: "Lead cross-functional squads shipping automation workflows to enterprise customers.",
    salary: "$145k – $170k",
  },
  {
    id: "job-2",
    title: "Senior Frontend Engineer",
    company: "Particle Labs",
    location: "San Francisco, CA",
    type: "Hybrid",
    tags: ["React", "GraphQL", "Data Viz"],
    relevanceScore: 89,
    posted: "4 days ago",
    summary: "Design and scale the analytics UI powering customer insights across B2B clients.",
    salary: "$160k – $185k",
  },
  {
    id: "job-3",
    title: "Automation Specialist",
    company: "Atlas Ops",
    location: "Remote",
    type: "Contract",
    tags: ["Python", "Airflow", "Workflows"],
    relevanceScore: 82,
    posted: "1 week ago",
    summary: "Build resilient, monitored job automation pipelines for marketplaces and SaaS tooling.",
    salary: "$90/hr",
  },
];

export const applicationRows = [
  {
    id: "app-1",
    role: "Product Engineer",
    company: "Northstar Automation",
    status: "queued" as const,
    submittedVia: "LinkedIn",
    appliedOn: "Oct 1, 2024",
    nextStep: "Auto-submit queued for 9:00am",
  },
  {
    id: "app-2",
    role: "Senior Frontend Engineer",
    company: "Particle Labs",
    status: "in-progress" as const,
    submittedVia: "Indeed",
    appliedOn: "Sep 30, 2024",
    nextStep: "Awaiting portfolio upload",
  },
  {
    id: "app-3",
    role: "Automation Specialist",
    company: "Atlas Ops",
    status: "submitted" as const,
    submittedVia: "Company site",
    appliedOn: "Sep 28, 2024",
    nextStep: "Follow-up reminder in 3 days",
  },
];

export const profileData = {
  personal: {
    fullName: "Ava Candidate",
    headline: "Product-focused Full-Stack Engineer",
    location: "Remote • North America",
    contact: "demo@aijobapply.com",
  },
  experience: [
    {
      company: "Northstar Automation",
      role: "Product Engineer",
      duration: "2022 – Present",
      highlights: [
        "Shipped automation flows reducing manual workload by 48%",
        "Co-led redesign of analytics dashboards adopted by 5 enterprise clients",
      ],
    },
    {
      company: "Particle Labs",
      role: "Software Engineer",
      duration: "2019 – 2022",
      highlights: [
        "Built experimentation tooling that enabled 25% faster iteration",
        "Scaled component library across four product lines",
      ],
    },
  ],
  skills: {
    core: ["TypeScript", "Next.js", "Node.js", "Design Systems"],
    supporting: ["Storybook", "Playwright", "Airflow", "Figma"],
    focusAreas: ["Automation", "Growth", "Product Strategy"],
  },
  preferences: {
    locations: ["Remote", "Hybrid (SF Bay Area)"] ,
    companySize: "Series B – Series D",
    salaryRange: "$155k – $190k base",
    startDate: "Ready within 4 weeks",
  },
  documents: [
    {
      name: "Resume – Product Engineer",
      status: "Optimized for automation roles",
      lastUpdated: "2 days ago",
    },
    {
      name: "Portfolio highlights",
      status: "Slideshare deck with case studies",
      lastUpdated: "1 week ago",
    },
  ],
};
