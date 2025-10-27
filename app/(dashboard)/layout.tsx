import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardTopbar } from '@/components/dashboard/topbar';
import { getServerAuthSession } from '@/lib/auth';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto bg-slate-50 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
