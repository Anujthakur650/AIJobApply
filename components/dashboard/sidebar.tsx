'use client';

import { Briefcase, FileText, GaugeCircle, Layers, Settings, Sparkles, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: GaugeCircle },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Job Discovery', href: '/jobs', icon: Sparkles },
  { label: 'Applications', href: '/applications', icon: FileText },
  { label: 'Campaigns', href: '/campaigns', icon: Layers },
  { label: 'Settings', href: '/settings', icon: Settings }
];

interface DashboardSidebarProps {
  collapsed?: boolean;
}

export function DashboardSidebar({ collapsed = false }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border/60 bg-white/80 backdrop-blur-lg transition-all duration-200',
        collapsed ? 'w-20' : 'w-60'
      )}
    >
      <div className="flex items-center gap-3 border-b border-border/60 px-6 py-5">
        <Briefcase className="h-6 w-6 text-primary" />
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold text-foreground">ApplyFlow</p>
            <p className="text-xs text-muted-foreground">Automation workspace</p>
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4">
        <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-xs text-muted-foreground">
          {!collapsed && (
            <p>
              Upgrade to unlock automated form submissions, AI cover letters, and advanced analytics tailored to your
              campaigns.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
