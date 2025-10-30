'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Job Discovery', href: '/jobs' },
  { label: 'My Applications', href: '/applications' },
  { label: 'Campaigns', href: '/campaigns', disabled: true },
  { label: 'Profile', href: '/profile' },
  { label: 'Settings', href: '/settings' },
];

export const Sidebar = ({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) => {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 flex-shrink-0 border-r border-slate-200 bg-white px-6 py-8 lg:flex lg:flex-col">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
          AIJobApply
        </p>
        <h2 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
          Automation HQ
        </h2>
      </div>

      <div className="mt-10 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.disabled ? '#' : item.href}
              aria-disabled={item.disabled}
              className={clsx(
                'flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition',
                item.disabled && 'cursor-not-allowed text-slate-300',
                !item.disabled &&
                  (isActive
                    ? 'bg-blue-50 text-[var(--primary)]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[var(--primary)]')
              )}
            >
              {item.label}
              {item.disabled ? (
                <span className="ml-auto text-[10px] uppercase tracking-widest text-slate-400">
                  Soon
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto rounded-xl bg-slate-100 px-4 py-5 text-sm text-slate-700">
        <p className="font-semibold">{user.name ?? user.email ?? 'Welcome'}</p>
        <p className="text-xs text-slate-500">Stay on top of your job search.</p>
      </div>
    </aside>
  );
};
