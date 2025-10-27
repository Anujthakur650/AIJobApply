'use client';

import type { ComponentProps } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const statusVariants: Record<string, { label: string; variant: ComponentProps<typeof Badge>['variant'] }> = {
  QUEUED: { label: 'Queued', variant: 'outline' },
  IN_PROGRESS: { label: 'In progress', variant: 'secondary' },
  SUBMITTED: { label: 'Submitted', variant: 'default' },
  FAILED: { label: 'Failed', variant: 'destructive' },
  RESPONDED: { label: 'Response received', variant: 'success' },
  INTERVIEW: { label: 'Interview', variant: 'success' },
  OFFER: { label: 'Offer', variant: 'success' },
  HIRED: { label: 'Hired', variant: 'success' },
  ARCHIVED: { label: 'Archived', variant: 'outline' }
};

interface ApplicationRecord {
  id: string;
  status: keyof typeof statusVariants;
  appliedAt?: string | null;
  responseAt?: string | null;
  notes?: string | null;
  job: {
    id: string;
    title: string;
    company: string;
    location?: string | null;
    url?: string | null;
  };
  campaign?: {
    id: string;
    name: string;
  } | null;
  latestEvents: Array<{
    id: string;
    status: string;
    message?: string | null;
    createdAt: string;
  }>;
}

interface ApplicationsResponse {
  applications: ApplicationRecord[];
}

export default function ApplicationsPage() {
  const { data, isLoading } = useQuery<ApplicationsResponse>({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await fetch('/api/applications');
      if (!response.ok) {
        throw new Error('Unable to fetch applications');
      }
      return response.json();
    }
  });

  const applications = data?.applications ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Application tracker</h1>
          <p className="text-sm text-muted-foreground">
            Monitor submission state, follow-up notes, and recruiter responses across every campaign.
          </p>
        </div>
        <Button className="gap-2">
          <ClipboardList className="h-4 w-4" />
          Enqueue application (coming soon)
        </Button>
      </div>

      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-border">
          <p className="text-sm text-muted-foreground">Loading application history...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            No applications found. Start a campaign or manually queue an opportunity to begin tracking automations.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => {
            const info = statusVariants[application.status] ?? { label: application.status, variant: 'outline' };
            return (
              <Card key={application.id} className="border border-border/70">
                <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">{application.job.title}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>{application.job.company}</span>
                      {application.job.location && <span>• {application.job.location}</span>}
                      {application.campaign && <span>• Campaign: {application.campaign.name}</span>}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <Badge variant={info.variant}>{info.label}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Submitted {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {application.notes && <p className="text-sm text-muted-foreground">{application.notes}</p>}
                  {application.latestEvents.length > 0 && (
                    <div className="space-y-1 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
                      {application.latestEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between">
                          <span>{event.message ?? event.status}</span>
                          <span>{new Date(event.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    {application.job.url && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={application.job.url} target="_blank" rel="noreferrer">
                          View posting
                        </Link>
                      </Button>
                    )}
                    <Button variant="secondary" size="sm">
                      Update status (soon)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
