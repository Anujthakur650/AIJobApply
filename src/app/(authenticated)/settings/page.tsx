import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import SettingsView from "@/components/settings/SettingsView";

export default async function SettingsPage() {
  const { userId } = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      timezone: true,
      phone: true,
      profile: {
        select: {
          strengthScore: true,
        },
      },
    },
  });

  return <SettingsView user={user} />;
}
