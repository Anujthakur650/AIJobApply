'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ApplicationStatusType =
  | 'QUEUED'
  | 'SUBMISSION_IN_PROGRESS'
  | 'SUBMITTED'
  | 'CONFIRMED'
  | 'FAILED'
  | 'CANCELLED'
  | 'RESPONDED'
  | 'ARCHIVED';

export type ApplicationQueueItem = {
  id: string;
  title: string;
  company: string;
  status: ApplicationStatusType;
  priority: number;
  createdAt: string;
  url: string;
  events: Array<{
    id: string;
    type: string;
    occurredAt: string;
  }>;
};

const statusTone: Record<ApplicationStatusType, 'info' | 'warning' | 'success' | 'neutral'> = {
  QUEUED: 'info',
  SUBMISSION_IN_PROGRESS: 'warning',
  SUBMITTED: 'success',
  CONFIRMED: 'success',
  FAILED: 'warning',
  CANCELLED: 'neutral',
  RESPONDED: 'success',
  ARCHIVED: 'neutral',
};

export default function ApplicationQueueView({
  initialQueue,
}: {
  initialQueue: ApplicationQueueItem[];
}) {
  const [items, setItems] = useState(initialQueue);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const reorderMutation = useMutation({
    mutationFn: async (order: string[]) => {
      const response = await fetch('/api/applications/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });

      if (!response.ok) {
        throw new Error('Unable to reorder applications');
      }

      return response.json();
    },
  });

  const handleDragStart = (id: string) => () => {
    setDraggedId(id);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (targetId: string) => (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!draggedId || draggedId === targetId) {
      return;
    }

    const currentIndex = items.findIndex((item) => item.id === draggedId);
    const targetIndex = items.findIndex((item) => item.id === targetId);
    if (currentIndex === -1 || targetIndex === -1) {
      return;
    }

    const previousItems = items;
    const updated = [...items];
    const [moved] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setItems(updated);
    setDraggedId(null);

    reorderMutation.mutate(updated.map((item) => item.id), {
      onError: () => setItems(previousItems),
    });
  };

  const handleDragEnd = () => setDraggedId(null);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Application queue</h1>
        <p className="text-sm text-slate-500">
          Prioritise submissions, approve generated content, and monitor automation status in one place.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <Card
            key={item.id}
            draggable
            onDragStart={handleDragStart(item.id)}
            onDragOver={handleDragOver}
            onDrop={handleDrop(item.id)}
            onDragEnd={handleDragEnd}
            className={`border-slate-200 ${draggedId === item.id ? 'opacity-50' : ''}`}
          >
            <CardHeader
              title={item.title}
              description={item.company}
              action={<Badge tone={statusTone[item.status]}>{item.status.replace(/_/g, ' ')}</Badge>}
            />
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <Badge tone="neutral">Priority {item.priority}</Badge>
                <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500">Recent events</p>
                {item.events.length === 0 ? (
                  <p className="text-xs text-slate-400">No events captured yet.</p>
                ) : (
                  <ul className="space-y-1 text-xs text-slate-500">
                    {item.events.map((event) => (
                      <li key={event.id}>
                        {event.type.replace(/_/g, ' ')} · {new Date(event.occurredAt).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button asChild size="sm" variant="secondary">
                  <a href={item.url} target="_blank" rel="noreferrer">
                    Review posting
                  </a>
                </Button>
                <Button size="sm" variant="ghost">
                  Open details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
