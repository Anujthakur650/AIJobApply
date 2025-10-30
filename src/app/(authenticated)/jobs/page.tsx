import { requireUser } from "@/lib/auth/session";
import { searchJobsForUser } from "@/lib/jobs/jobService";
import JobDiscoveryView from "@/components/jobs/JobDiscoveryView";

export default async function JobsPage() {
  const { userId } = await requireUser();
  const initialJobs = await searchJobsForUser(userId, {
    limit: 20,
    threshold: 0.6,
  });

  return <JobDiscoveryView initialJobs={initialJobs} />;
}
