import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';

import { AppProviders } from '@/components/providers/app-providers';
import { cn } from '@/lib/utils';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'ApplyFlow | Automated Job Application Platform',
  description:
    'ApplyFlow is an intelligent job automation platform that streamlines job discovery, matching, and application workflows for modern professionals.'
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={cn('bg-background', inter.variable)} suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background text-foreground antialiased')}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
