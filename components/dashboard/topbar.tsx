'use client';

import { Bell, LogOut } from 'lucide-react';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DashboardTopbar() {
  const { data } = useSession();
  const user = data?.user;

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/60 bg-white/80 px-6 py-3 backdrop-blur">
      <div className="hidden items-center gap-3 text-sm text-muted-foreground sm:flex">
        <span className="text-xs uppercase tracking-wider text-secondary">Live</span>
        <span>Monitoring job queues & application pipeline</span>
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">
        <button
          type="button"
          className={cn(
            'relative flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-white text-muted-foreground transition',
            'hover:text-foreground'
          )}
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-secondary" />
        </button>
        <div className="flex items-center gap-3">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name ?? 'User avatar'}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {(user?.name ?? 'A')[0]?.toUpperCase()}
            </div>
          )}
          <div className="hidden text-right sm:flex sm:flex-col">
            <span className="text-sm font-semibold text-foreground">{user?.name ?? 'Automation expert'}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="hidden items-center gap-2 sm:flex"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
