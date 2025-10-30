'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const schema = z
  .object({
    name: z.string().min(2, 'Add your full name'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setStatus('idle');
    setMessage(null);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      setStatus('error');
      setMessage(
        data?.error ?? 'We could not create your account. Please try again.'
      );
      return;
    }

    setStatus('success');
    setMessage('Check your inbox for a verification link to activate your account.');
    form.reset();

    setTimeout(() => {
      router.push('/login');
    }, 4000);
  });

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <div className="mx-auto flex w-full max-w-lg flex-col justify-center px-6 py-16">
        <Card className="shadow-lg shadow-blue-100">
          <CardContent className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-[var(--foreground)]">
                Create your account
              </h1>
              <p className="text-sm text-slate-500">
                Verify your email, upload resumes, and orchestrate AI-powered job campaigns in minutes.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600" htmlFor="name">
                  Full name
                </label>
                <Input id="name" {...form.register('name')} />
                {form.formState.errors.name ? (
                  <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600" htmlFor="email">
                  Email
                </label>
                <Input id="email" type="email" {...form.register('email')} />
                {form.formState.errors.email ? (
                  <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600" htmlFor="password">
                    Password
                  </label>
                  <Input id="password" type="password" {...form.register('password')} />
                  {form.formState.errors.password ? (
                    <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600" htmlFor="confirmPassword">
                    Confirm password
                  </label>
                  <Input id="confirmPassword" type="password" {...form.register('confirmPassword')} />
                  {form.formState.errors.confirmPassword ? (
                    <p className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
                  ) : null}
                </div>
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
                Create account
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-[var(--primary)] hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
