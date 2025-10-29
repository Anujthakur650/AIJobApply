'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const schema = z
  .object({
    password: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string().min(8, 'Minimum 8 characters'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type Values = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params?.get('token') ?? '';

  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setMessage(null);
    setStatus('idle');

    const response = await fetch('/api/auth/password/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: values.password }),
    });

    if (!response.ok) {
      const data = await response.json();
      setStatus('error');
      setMessage(data?.error ?? 'Unable to reset password.');
      return;
    }

    setStatus('success');
    setMessage('Password updated. Redirecting to sign in...');
    form.reset();
    setTimeout(() => router.push('/login'), 3000);
  });

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-6 py-16">
        <Card className="shadow-lg shadow-blue-100">
          <CardContent className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-[var(--foreground)]">
                Choose a new password
              </h1>
              <p className="text-sm text-slate-500">
                Your new password should be unique and secure.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600" htmlFor="password">
                  New password
                </label>
                <Input id="password" type="password" {...form.register('password')} />
                {form.formState.errors.password ? (
                  <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600" htmlFor="confirmPassword">
                  Confirm new password
                </label>
                <Input id="confirmPassword" type="password" {...form.register('confirmPassword')} />
                {form.formState.errors.confirmPassword ? (
                  <p className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
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
                Update password
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
