'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerSchema } from '@/lib/validators';

const formSchema = registerSchema;
type FormValues = z.infer<typeof formSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? 'Unable to create your account');
      }

      toast.success('Account created! Redirecting...');

      await signIn('credentials', {
        email: values.email,
        password: values.password,
        callbackUrl: '/dashboard'
      });

      router.push('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
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
            <CardTitle className="text-2xl font-semibold text-foreground">Create your ApplyFlow account</CardTitle>
            <CardDescription>
              Upload your resume, configure preferences, and let automation accelerate your job search.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Taylor Jenkins" autoComplete="name" {...register('name')} />
                {errors.name && <p className="text-xs font-medium text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && <p className="text-xs font-medium text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
                {errors.password && <p className="text-xs font-medium text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')} />
                {errors.confirmPassword && (
                  <p className="text-xs font-medium text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/sign-in" className="font-semibold text-primary transition hover:text-primary/80">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
