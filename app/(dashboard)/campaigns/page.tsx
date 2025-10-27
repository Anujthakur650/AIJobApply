'use client';

import type { ComponentProps } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { BarChart3, Target } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { campaignCreateSchema } from '@/lib/validators';

interface Campaign {
  id: string;
  name: string;
  status: string;
  targetTitles: string[];
  targetLocations: string[];
  keywords: string[];
  dailyLimit: number;
  workModes: string[];
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  totals: number;
  responses: number;
  submitted: number;
  statusBreakdown: Record<string, number>;
}

interface CampaignResponse {
  campaigns: Campaign[];
}

const createSchema = campaignCreateSchema.extend({
  targetTitlesText: z.string().optional(),
  targetLocationsText: z.string().optional(),
  keywordsText: z.string().optional()
});

type FormValues = z.infer<typeof createSchema>;

const statusStyles: Record<string, { label: string; variant: ComponentProps<typeof Badge>['variant'] }> = {
  DRAFT: { label: 'Draft', variant: 'outline' },
  ACTIVE: { label: 'Active', variant: 'secondary' },
  PAUSED: { label: 'Paused', variant: 'outline' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  ARCHIVED: { label: 'Archived', variant: 'outline' }
};

const parseList = (value?: string | null) =>
  (value ?? '')
    .split(/,|\n/g)
    .map((item) => item.trim())
    .filter(Boolean);

export default function CampaignsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<CampaignResponse>({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/campaigns');
      if (!response.ok) {
        throw new Error('Unable to load campaigns');
      }
      return response.json();
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: '',
      targetTitlesText: '',
      targetLocationsText: '',
      keywordsText: '',
      dailyLimit: 15,
      workModes: []
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        name: values.name,
        targetTitles: parseList(values.targetTitlesText),
        targetLocations: parseList(values.targetLocationsText),
        keywords: parseList(values.keywordsText),
        dailyLimit: Number(values.dailyLimit) || 10,
        workModes: values.workModes ?? []
      };

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? 'Unable to create campaign');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Campaign created');
      reset({ name: '', targetTitlesText: '', targetLocationsText: '', keywordsText: '', dailyLimit: 15, workModes: [] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to create campaign';
      toast.error(message);
    }
  });

  const campaigns = data?.campaigns ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Campaign management</h1>
          <p className="text-sm text-muted-foreground">
            Organize automated job searches by role, location, and priority. Track progress and iterate quickly.
          </p>
        </div>
        <Badge variant="secondary" className="gap-2 text-xs">
          <BarChart3 className="h-3.5 w-3.5" /> {campaigns.length} campaigns
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create a new campaign</CardTitle>
            <CardDescription>Define your ideal role criteria and let ApplyFlow run targeted outreach.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((values) => mutation.mutate(values))}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Campaign name</Label>
                <Input id="name" placeholder="Staff frontend roles" {...register('name')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetTitlesText">Target titles</Label>
                <Textarea id="targetTitlesText" rows={3} placeholder="Staff Frontend Engineer, Senior UI Engineer" {...register('targetTitlesText')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetLocationsText">Target locations</Label>
                <Textarea id="targetLocationsText" rows={3} placeholder="Remote, Austin, New York" {...register('targetLocationsText')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywordsText">Keywords</Label>
                <Textarea id="keywordsText" rows={3} placeholder="React, Design Systems, SaaS" {...register('keywordsText')} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dailyLimit">Daily application limit</Label>
                  <Input id="dailyLimit" type="number" min={1} max={200} {...register('dailyLimit', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Work modes</Label>
                  <div className="flex flex-wrap gap-2">
                    {['REMOTE', 'HYBRID', 'ONSITE'].map((mode) => (
                      <label key={mode} className="flex items-center gap-2 rounded-lg border border-border/80 bg-white px-3 py-2 text-xs font-medium">
                        <input type="checkbox" value={mode} {...register('workModes')} className="h-4 w-4" />
                        {mode.toLowerCase()}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <Button type="submit" className="gap-2" disabled={isSubmitting || mutation.isPending}>
                <Target className="h-4 w-4" /> Create campaign
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-dashed border-secondary/50 bg-secondary/5">
          <CardHeader>
            <CardTitle>Automation guardrails</CardTitle>
            <CardDescription>
              Campaign throttling, human-like pacing, and compliance checks keep your outreach trustworthy and effective.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Configure application batching per day with smart pause/resume controls.</p>
            <p>• Respect job board rate limits and CAPTCHA requirements automatically.</p>
            <p>• Review generated cover letters before release to maintain tone and accuracy.</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-border">
          <p className="text-sm text-muted-foreground">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-border">
          <p className="text-sm text-muted-foreground">No campaigns yet. Create one to launch automated outreach.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => {
            const status = statusStyles[campaign.status] ?? { label: campaign.status, variant: 'outline' };
            return (
              <Card key={campaign.id} className="border border-border/60">
                <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">{campaign.name}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {campaign.targetTitles.slice(0, 3).map((title) => (
                        <span key={title}>{title}</span>
                      ))}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <span className="text-xs text-muted-foreground">Daily limit: {campaign.dailyLimit}</span>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{campaign.totals}</p>
                    <p className="text-xs text-muted-foreground">Applications queued</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{campaign.submitted}</p>
                    <p className="text-xs text-muted-foreground">Submitted</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{campaign.responses}</p>
                    <p className="text-xs text-muted-foreground">Responses</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">
                      {campaign.statusBreakdown['INTERVIEW'] ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Interview invites</p>
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
