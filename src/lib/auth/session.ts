import type { Session } from "next-auth";
import { authOptions, getSession } from "@/lib/auth/options";
import { getServerSession } from "next-auth";

export const currentSession = () => getServerSession(authOptions);

export const requireSession = async (): Promise<Session> => {
  const session = await getSession();

  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }

  return session;
};

export const requireUser = async () => {
  const session = await requireSession();

  if (!session.user?.id) {
    throw new Error("USER_MISSING");
  }

  return {
    session,
    userId: session.user.id,
    role: session.user.role ?? "USER",
  } as {
    session: Session;
    userId: string;
    role: string;
  };
};
