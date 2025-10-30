'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AuthenticatedError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Authenticated layout error', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] text-center">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">Something went wrong</h1>
      <p className="max-w-sm text-sm text-slate-500">
        We were unable to load your workspace. Retry to continue or contact support if the issue persists.
      </p>
      <Button onClick={reset} variant="primary">
        Retry
      </Button>
    </div>
  );
}
