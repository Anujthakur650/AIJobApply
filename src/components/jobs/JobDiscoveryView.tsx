'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { JobListItem } from '@/lib/jobs/jobService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const fetchJobs = async (filters: Record<string, string | number | boolean | undefined>) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === false) {
      return;
    }

    params.set(key, String(value));
  });

  const response = await fetch(`/api/jobs?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Unable to fetch jobs');
  }

  const data = await response.json();
  return data.jobs as JobListItem[];
};

const toTimestamp = (value: Date | string | null | undefined) => {
  if (!value) {
    return 0;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const sortJobs = (jobs: JobListItem[], sort: string) => {
  switch (sort) {
    case 'date':
      return [...jobs].sort((a, b) => toTimestamp(b.postingDate) - toTimestamp(a.postingDate));
    case 'salary':
      return [...jobs].sort((a, b) => {
        const aLabel = (a.salaryRange as { label?: string } | null)?.label ?? '';
        const bLabel = (b.salaryRange as { label?: string } | null)?.label ?? '';
        return bLabel.localeCompare(aLabel);
      });
    case 'match':
    default:
      return [...jobs].sort((a, b) => b.matchScore - a.matchScore);
  }
};

const JobCard = ({ job }: { job: JobListItem }) => (
  <Card className="border-slate-200">
    <CardHeader
      title={job.title}
      description={job.company}
      action={<Badge tone={job.passesThreshold ? 'success' : 'warning'}>{job.matchScore}% match</Badge>}
    />
    <CardContent className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        {job.location ? <Badge tone="neutral">{job.location}</Badge> : null}
        {job.salaryRange ? (
          <Badge tone="info">{(job.salaryRange as { label?: string } | null)?.label ?? 'Salary disclosed'}</Badge>
        ) : (
          <Badge tone="neutral">Salary not shared</Badge>
        )}
        {job.employmentType ? <Badge tone="neutral">{job.employmentType}</Badge> : null}
      </div>
      <p className="text-sm leading-relaxed text-slate-600">
        {job.description?.slice(0, 220)}{job.description && job.description.length > 220 ? '…' : ''}
      </p>
      <ul className="space-y-1 text-xs text-slate-500">
        {job.matchReasons.slice(0, 3).map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <Button asChild variant="secondary" size="sm">
          <a href={job.url ?? '#'} target="_blank" rel="noreferrer">
            View details
          </a>
        </Button>
        <Button variant="ghost" size="sm">
          Save
        </Button>
        <Button variant="primary" size="sm">
          Apply
        </Button>
      </div>
    </CardContent>
  </Card>
);

const LoadingSkeleton = () => (
  <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
    <div className="h-5 w-1/2 animate-pulse rounded-full bg-slate-200" />
    <div className="h-4 w-1/3 animate-pulse rounded-full bg-slate-100" />
    <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
    <div className="h-3 w-3/4 animate-pulse rounded-full bg-slate-100" />
  </div>
);

const REFRESH_FALLBACK_QUERY = 'Software Engineer';

export default function JobDiscoveryView({ initialJobs }: { initialJobs: JobListItem[] }) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minSalary, setMinSalary] = useState('');
  const [sort, setSort] = useState('match');

  const filters = useMemo(
    () => ({
      q: query,
      location,
      remote: remoteOnly ? 'true' : undefined,
      minSalary: minSalary || undefined,
      sort,
    }),
    [query, location, remoteOnly, minSalary, sort]
  );

  const jobsQuery = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => fetchJobs(filters),
    placeholderData: initialJobs,
    initialData: initialJobs,
    keepPreviousData: true,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query || REFRESH_FALLBACK_QUERY,
          location: location || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to queue scraping job');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] }).catch(() => undefined);
    },
  });

  const sortedJobs = useMemo(
    () => sortJobs(jobsQuery.data ?? [], sort),
    [jobsQuery.data, sort]
  );

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Job discovery</h1>
        <p className="text-sm text-slate-500">
          Scan curated opportunities across LinkedIn, Indeed, and Glassdoor. Tweak filters to surface the
          most relevant automation targets.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Input
          placeholder="Role or keyword"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="md:col-span-2"
        />
        <Input
          placeholder="Location (e.g. Remote, Austin, TX)"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4">
          <input
            type="checkbox"
            id="remote-filter"
            checked={remoteOnly}
            onChange={(event) => setRemoteOnly(event.target.checked)}
          />
          <label htmlFor="remote-filter" className="text-sm text-slate-600">
            Remote only
          </label>
        </div>
        <Input
          placeholder="Minimum salary (USD)"
          value={minSalary}
          onChange={(event) => setMinSalary(event.target.value)}
        />
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--primary)] focus:outline-none"
        >
          <option value="match">Sort by match score</option>
          <option value="date">Most recent</option>
          <option value="salary">Salary (desc)</option>
        </select>
        <Button
          variant="primary"
          loading={jobsQuery.isFetching}
          onClick={() => jobsQuery.refetch()}
        >
          Apply filters
        </Button>
        <Button
          variant="secondary"
          loading={refreshMutation.isLoading}
          onClick={() => refreshMutation.mutate()}
        >
          Refresh results
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {jobsQuery.isLoading ? (
          <>
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </>
        ) : sortedJobs.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="py-10 text-center text-sm text-slate-500">
              No jobs match the selected filters yet. Queue a refresh or widen your search.
            </CardContent>
          </Card>
        ) : (
          sortedJobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </section>
    </div>
  );
}
