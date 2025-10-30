"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { APP_NAME, DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/constants";

export default function AuthPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"sign-in" | "sign-up">("sign-in");

  const onSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").toLowerCase();
    const password = String(form.get("password") ?? "");

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setIsSubmitting(false);

    if (response?.error) {
      toast.error("Invalid credentials", {
        description: "Use the provided demo email and password to explore the preview.",
      });
      return;
    }

    toast.success("Signed in", {
      description: "You can now navigate across the dashboard, jobs, and applications.",
    });
    router.push("/dashboard");
  };

  const onSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.info("Sign-up placeholder", {
      description:
        "This preview does not create accounts. Use the demo credentials to continue.",
    });
    setActiveTab("sign-in");
  };

  return (
    <div className="container grid min-h-[calc(100vh-160px)] place-items-center py-10">
      <Card className="w-full max-w-xl border-border/70">
        <CardHeader className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary">Preview only</Badge>
            <span className="text-sm text-muted-foreground">Credentials powered by NextAuth</span>
          </div>
          <CardTitle className="text-3xl font-semibold text-foreground">Access {APP_NAME}</CardTitle>
          <CardDescription>
            Sign in with the provided credentials or explore the mocked sign-up flow. Google OAuth will
            become available once client secrets are configured.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "authenticated" ? (
            <div className="rounded-lg border border-success/40 bg-success/10 p-4 text-sm text-success-foreground">
              You are already signed in. Jump straight to the <Link href="/dashboard" className="font-semibold underline">dashboard</Link>.
            </div>
          ) : null}

          <div className="rounded-lg border border-dashed border-border/60 bg-background/80 p-4 text-sm">
            Use <span className="font-semibold">{DEMO_EMAIL}</span> / <span className="font-semibold">{DEMO_PASSWORD}</span> when testing the credentials provider.
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <TabsList className="w-full">
              <TabsTrigger value="sign-in" className="flex-1">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="sign-up" className="flex-1">
                Sign up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sign-in" className="mt-6 space-y-4 rounded-lg border border-border/70 bg-background/80 p-6">
              <form className="space-y-4" onSubmit={onSignIn}>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={DEMO_EMAIL} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required defaultValue={DEMO_PASSWORD} />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Checking credentials..." : "Continue"}
                </Button>
              </form>
              <Button variant="outline" className="w-full" disabled>
                Continue with Google (coming soon)
              </Button>
            </TabsContent>
            <TabsContent value="sign-up" className="mt-6 space-y-4 rounded-lg border border-border/70 bg-background/80 p-6">
              <form className="space-y-4" onSubmit={onSignUp}>
                <div className="grid gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" placeholder="Your name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-email">Email</Label>
                  <Input id="new-email" name="new-email" type="email" placeholder="you@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">Password</Label>
                  <Input id="new-password" name="new-password" type="password" placeholder="••••••••" />
                </div>
                <Button type="submit" className="w-full">
                  Create account (mock)
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
