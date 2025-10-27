'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInSchema } from '@/lib/validators';

const formSchema = signInSchema;
type FormValues = z.infer<typeof formSchema>;

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = await signIn('credentials', {
        ...values,
        redirect: false
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success('Welcome back!');
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-50 via-white to-slate-200 py-12">
      <div className="mx-auto w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <Link href="/" className="text-sm font-semibold text-primary transition hover:text-primary/80">
            ← Back to landing
          </Link>
        </div>
        <Card className="shadow-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-foreground">Sign in to ApplyFlow</CardTitle>
            <CardDescription>Access your automation dashboard, campaigns, and real-time analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" autoComplete="email" {...register('email')} />
                {errors.email && <p className="text-xs font-medium text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
                {errors.password && (
                  <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              New to ApplyFlow?{' '}
              <Link href="/sign-up" className="font-semibold text-primary transition hover:text-primary/80">
                Create an account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
