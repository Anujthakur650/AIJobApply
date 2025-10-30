import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { currentSession } from "@/lib/auth/session";
import { Sidebar } from "@/components/navigation/Sidebar";
import { TopBar } from "@/components/navigation/TopBar";
import { initializeQueues } from "@/lib/queue/bootstrap";
import { startImapListener } from "@/lib/email/imapListener";

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await currentSession();

  if (!session) {
    redirect("/login");
  }

  await initializeQueues();
  await startImapListener();

  const user = {
    name: session.user?.name ?? null,
    email: session.user?.email ?? null,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col">
        <TopBar user={{ name: user.name ?? undefined }} />
        <main className="flex-1 overflow-y-auto bg-[var(--background)] px-6 py-8">
          <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
