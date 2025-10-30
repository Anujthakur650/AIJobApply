"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Jobs", href: "/jobs" },
  { label: "Applications", href: "/applications" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/settings" },
];

const getInitials = (value?: string | null) =>
  value
    ?.split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase())
    .slice(0, 2)
    .join("") || "AI";

export function SiteHeader() {
  const { status, data } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-base font-semibold text-primary shadow-sm">
              AI
            </span>
            <span className="hidden sm:inline-block">{APP_NAME}</span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-primary",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {status === "authenticated" && data?.user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{data.user.name}</p>
                <p className="text-xs text-muted-foreground">{data.user.headline ?? "Signed in"}</p>
              </div>
              <Avatar className="h-9 w-9 border border-primary/30 text-xs font-medium">
                <AvatarFallback>{getInitials(data.user.name)}</AvatarFallback>
              </Avatar>
            </div>
          ) : null}
          <div className="hidden sm:flex">
            {status === "authenticated" ? (
              <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </Button>
            ) : (
              <Button onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}>Sign in</Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>
      {mobileOpen ? (
        <div className="border-t border-border/80 bg-background shadow-sm sm:hidden">
          <nav className="container grid gap-1 py-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2">
              {status === "authenticated" ? (
                <Button className="w-full" onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign out
                </Button>
              ) : (
                <Button className="w-full" onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}>
                  Sign in
                </Button>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
