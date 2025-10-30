import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-background">
      <div className="container flex flex-col gap-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {APP_NAME}. Built with Next.js 14, Tailwind CSS, and shadcn/ui.
        </p>
        <nav className="flex flex-wrap items-center gap-4">
          <Link href="/jobs" className="hover:text-primary">
            Browse jobs
          </Link>
          <Link href="/applications" className="hover:text-primary">
            Track applications
          </Link>
          <Link href="/settings" className="hover:text-primary">
            Settings
          </Link>
          <Link
            href="https://vercel.com/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary"
          >
            Powered by Vercel
          </Link>
        </nav>
      </div>
    </footer>
  );
}
