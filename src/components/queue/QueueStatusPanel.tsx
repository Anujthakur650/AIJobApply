'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type QueueStatus = {
  queue: string;
  counts?: Record<string, number>;
  metrics?: Record<string, unknown>;
  error?: string;
};

type ApiResponse = {
  queues: QueueStatus[];
};

const fetchStatus = async (): Promise<ApiResponse> => {
  const response = await fetch('/api/queues/status');
  if (!response.ok) {
    throw new Error('Unable to load queue status');
  }
  return response.json();
};

const getHealthLabel = (counts?: Record<string, number>): { label: string; tone: 'info' | 'success' | 'warning' } => {
  if (!counts) {
    return { label: 'Unknown', tone: 'info' };
  }

  const waiting = counts.waiting ?? 0;
  const failed = counts.failed ?? 0;

  if (failed > 0) {
    return { label: 'Attention', tone: 'warning' };
  }

  if (waiting > 50) {
    return { label: 'Backlog', tone: 'info' };
  }

  return { label: 'Healthy', tone: 'success' };
};

export default function QueueStatusPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['queues'],
    queryFn: fetchStatus,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader title="Queue health" description="BullMQ workers" />
        <CardContent>
          <p className="text-sm text-slate-500">Loading queue metrics…</p>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader title="Queue health" description="BullMQ workers" />
        <CardContent>
          <p className="text-sm text-red-600">Unable to load queue status.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Queue health" description="BullMQ workers" />
      <CardContent className="space-y-3">
        {data.queues.map((queue) => {
          const health = getHealthLabel(queue.counts);
          return (
            <div key={queue.queue} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">{queue.queue}</p>
                {queue.error ? (
                  <p className="text-xs text-red-600">{queue.error}</p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Waiting {queue.counts?.waiting ?? 0} · Active {queue.counts?.active ?? 0} · Failed {queue.counts?.failed ?? 0}
                  </p>
                )}
              </div>
              <Badge tone={health.tone}>{health.label}</Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
