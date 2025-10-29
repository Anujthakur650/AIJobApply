'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function VerifyPage() {
  const params = useSearchParams();
  const token = params?.get('token');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'pending'>('idle');
  const [message, setMessage] = useState<string>('Verifying your email...');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification link is missing or invalid.');
        return;
      }

      setStatus('pending');

      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const data = await response.json();
        setStatus('error');
        setMessage(data?.error ?? 'We could not verify your email.');
        return;
      }

      setStatus('success');
      setMessage('Email verified! You can now sign in to your workspace.');
    };

    void verify();
  }, [token]);

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-6 py-16">
        <Card className="shadow-lg shadow-blue-100">
          <CardContent className="space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-[var(--foreground)]">
                Email verification
              </h1>
              <p
                className={`text-sm ${
                  status === 'error'
                    ? 'text-red-600'
                    : status === 'success'
                    ? 'text-emerald-600'
                    : 'text-slate-500'
                }`}
              >
                {message}
              </p>
            </div>

            <div className="space-y-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => (window.location.href = '/login')}
                disabled={status === 'pending'}
              >
                Back to sign in
              </Button>
              <Link href="/register" className="block text-sm text-[var(--primary)] hover:underline">
                Need a new account?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
