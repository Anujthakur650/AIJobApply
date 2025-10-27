'use client';

import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Filter, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  employmentType?: string | null;
  workMode?: string | null;
  salaryRange?: string | null;
  source: string;
  url?: string | null;
  postedAt?: string | null;
  description: string;
  score: number;
  matchedSkills: string[];
  totalSkills: number;
  requiredSkills: Array<{
    id: string;
    name: string;
    importance: number;
  }>;
}

interface JobsResponse {
  jobs: JobMatch[];
}

export default function JobsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery<JobsResponse>({
    queryKey: ['jobs', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) {
        params.set('q', search);
      }
      params.set('limit', '30');

      const response = await fetch(`/api/jobs?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Unable to fetch jobs');
      }

      return response.json();
    }
  });

  const jobs = useMemo(() => data?.jobs ?? [], [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Recommended roles</h1>
          <p className="text-sm text-muted-foreground">
            Personalized opportunities ranked by match quality, skill alignment, and preference fit.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Advanced filters (coming soon)
        </Button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-white/80 p-3 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title, company, or keyword"
          className="border-none shadow-none focus-visible:ring-0"
        />
      </div>

      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-border">
          <p className="text-sm text-muted-foreground">Loading personalized job matches...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            No matching roles yet. Update your profile or broaden your filters to discover more opportunities.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="border border-border/60">
              <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-foreground">{job.title}</CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>{job.company}</span>
                    {job.location && <span>• {job.location}</span>}
                    {job.employmentType && <span>• {job.employmentType.replace('_', ' ')}</span>}
                    {job.workMode && <span>• {job.workMode}</span>}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                  <Badge variant="success">Match score {job.score}%</Badge>
                  <div className="w-36">
                    <Progress value={job.score} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {job.matchedSkills.length} of {job.totalSkills || job.requiredSkills.length} required skills detected
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.salaryRange && (
                  <p className="text-sm font-medium text-foreground">Compensation: {job.salaryRange}</p>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.slice(0, 8).map((skill) => (
                    <Badge key={skill.id} variant={job.matchedSkills.includes(skill.name.toLowerCase()) ? 'success' : 'outline'}>
                      {skill.name}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Source: {job.source.toLowerCase()}</span>
                  {job.postedAt && <span>• Posted {new Date(job.postedAt).toLocaleDateString()}</span>}
                </div>
                <div className="flex items-center gap-3">
                  {job.url && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={job.url} target="_blank" rel="noreferrer">
                        View posting <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  )}
                  <Button size="sm">Queue application</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
