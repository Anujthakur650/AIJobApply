'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setMessage(null);
    setStatus('idle');

    const response = await fetch('/api/auth/password/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      setStatus('error');
      setMessage('We were unable to process your request. Please try again.');
      return;
    }

    setStatus('success');
    setMessage('If an account exists for this email, a reset link has been sent.');
    form.reset();
  });

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-6 py-16">
        <Card className="shadow-lg shadow-blue-100">
          <CardContent className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-[var(--foreground)]">
                Reset your password
              </h1>
              <p className="text-sm text-slate-500">
                Enter your email and we’ll send you a secure link to create a new password.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600" htmlFor="email">
                  Email
                </label>
                <Input id="email" type="email" {...form.register('email')} />
                {form.formState.errors.email ? (
                  <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                ) : null}
              </div>

              {message ? (
                <p
                  className={`rounded-lg px-3 py-2 text-xs ${
                    status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {message}
                </p>
              ) : null}

              <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
                Send reset link
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500">
              <Link href="/login" className="text-[var(--primary)] hover:underline">
                Return to sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
