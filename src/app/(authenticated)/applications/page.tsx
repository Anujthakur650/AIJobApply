import { requireUser } from "@/lib/auth/session";
import { getApplicationQueue } from "@/lib/applications/service";
import ApplicationQueueView from "@/components/applications/ApplicationQueueView";

export default async function ApplicationsPage() {
  const { userId } = await requireUser();
  const applications = await getApplicationQueue(userId);

  const queue = applications.map((application) => ({
    id: application.id,
    title: application.jobPosting?.title ?? 'Application',
    company: application.jobPosting?.company ?? 'Unknown company',
    status: application.status,
    priority: application.priority,
    createdAt: application.createdAt.toISOString(),
    url: application.jobPosting?.url ?? '#',
    events: application.events.slice(0, 3).map((event) => ({
      id: event.id,
      type: event.type,
      occurredAt: event.occurredAt.toISOString(),
    })),
  }));

  return <ApplicationQueueView initialQueue={queue} />;
}
