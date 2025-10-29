import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getQueue } from "@/lib/queue/queueProvider";

export const createCampaign = async (
  data: Prisma.CampaignCreateInput
) => {
  const campaign = await prisma.campaign.create({
    data,
    include: {
      jobs: true,
      applications: true,
    },
  });

  return campaign;
};

export const enqueueCampaignJobs = async (campaignId: string) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      jobs: {
        include: {
          jobMatch: {
            include: {
              jobPosting: true,
            },
          },
        },
      },
    },
  });

  if (!campaign) {
    throw new Error(`Campaign ${campaignId} not found`);
  }

  const { queue } = getQueue("applications");

  await Promise.all(
    campaign.jobs.map((item) =>
      queue.add(
        "campaign-application",
        {
          campaignId,
          jobMatchId: item.jobMatchId,
        },
        {
          priority: item.priority,
          delay: item.scheduledFor ? Math.max(item.scheduledFor.getTime() - Date.now(), 0) : 0,
        }
      )
    )
  );
};
