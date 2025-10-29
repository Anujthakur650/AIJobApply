'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const TopBar = ({
  user,
  onSearch,
}: {
  user: { name?: string | null };
  onSearch?: (value: string) => void;
}) => {
  const router = useRouter();

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onSearch) return;
    const formData = new FormData(event.currentTarget);
    onSearch(String(formData.get('search') ?? ''));
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <form className="hidden max-w-md flex-1 lg:block" onSubmit={handleSearch}>
        <Input
          name="search"
          placeholder="Search across jobs, applications, notes..."
          className="bg-slate-50"
        />
      </form>

      <div className="flex flex-1 items-center justify-end gap-3">
        <span className="hidden text-sm text-slate-500 md:inline">{user.name ? `Hi, ${user.name}` : 'Your workspace'}</span>
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => router.push('/onboarding')}
        >
          Onboarding
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Sign out
        </Button>
      </div>
    </header>
  );
};
