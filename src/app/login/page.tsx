'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
});

type LoginValues = z.infer<typeof schema>;

const oauthProviders = [
  { id: 'google', label: 'Continue with Google' },
  { id: 'linkedin', label: 'Continue with LinkedIn' },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setServerError(null);

    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error === 'EMAIL_NOT_VERIFIED') {
        setServerError('Please verify your email address before signing in.');
        return;
      }

      setServerError('Invalid email or password.');
      return;
    }

    router.push('/dashboard');
  });

  const errorParam = searchParams?.get('error');

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-6 py-16">
        <Card className="shadow-lg shadow-blue-100">
          <CardContent className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-[var(--foreground)]">
                Sign in to AIJobApply
              </h1>
              <p className="text-sm text-slate-500">
                Automate your job search with intelligent matching and applications.
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600" htmlFor="password">
                  Password
                </label>
                <Input id="password" type="password" {...form.register('password')} />
                {form.formState.errors.password ? (
                  <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                ) : null}
              </div>

              {(serverError || errorParam) && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                  {serverError ?? 'Authentication failed. Please try again.'}
                </p>
              )}

              <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
                Continue
              </Button>
            </form>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                or continue with
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="space-y-2">
                {oauthProviders.map((provider) => (
                  <Button
                    key={provider.id}
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => signIn(provider.id)}
                  >
                    {provider.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500">
              <Link href="/register" className="hover:text-[var(--primary)]">
                Create account
              </Link>
              <Link href="/forgot-password" className="hover:text-[var(--primary)]">
                Forgot password?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
