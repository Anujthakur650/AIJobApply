'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type SettingsUser = {
  id: string;
  email: string | null;
  name: string | null;
  timezone: string | null;
  phone: string | null;
  profile: {
    strengthScore: number;
  } | null;
};

export default function SettingsView({ user }: { user: SettingsUser | null }) {
  const [name, setName] = useState(user?.name ?? '');
  const [timezone, setTimezone] = useState(user?.timezone ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [reason, setReason] = useState('');

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, timezone, phone }),
      });
      if (!response.ok) {
        throw new Error('Unable to update settings');
      }
      return response.json();
    },
  });

  const deletionMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) {
        throw new Error('Unable to request deletion');
      }
      return response.json();
    },
  });

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Settings</h1>
        <p className="text-sm text-slate-500">Manage account details, compliance requests, and notification preferences.</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader title="Account information" description="Keep your workspace profile current" />
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500" htmlFor="name">Name</label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500" htmlFor="timezone">Timezone</label>
              <Input id="timezone" value={timezone} onChange={(event) => setTimezone(event.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500" htmlFor="phone">Phone</label>
              <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <Button
              variant="primary"
              loading={updateMutation.isLoading}
              onClick={() => updateMutation.mutate()}
            >
              Save changes
            </Button>
            {updateMutation.isError ? (
              <p className="text-xs text-red-600">We couldn't update your profile. Try again.</p>
            ) : null}
            {updateMutation.isSuccess ? (
              <p className="text-xs text-emerald-600">Profile updated successfully.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Compliance" description="GDPR & data retention" />
          <CardContent className="space-y-3 text-sm text-slate-500">
            <p>Your profile strength is {user?.profile?.strengthScore ?? 0}%.</p>
            <p>Need to export or delete your data? Submit a request and our automation will process it within 7 days.</p>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Reason for deletion request"
              className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--primary)] focus:outline-none"
              rows={4}
            />
            <Button
              variant="secondary"
              loading={deletionMutation.isLoading}
              onClick={() => deletionMutation.mutate()}
            >
              Request data deletion
            </Button>
            {deletionMutation.isError ? (
              <p className="text-xs text-red-600">Unable to submit deletion request.</p>
            ) : null}
            {deletionMutation.isSuccess ? (
              <p className="text-xs text-emerald-600">Deletion request submitted. We will confirm by email.</p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
