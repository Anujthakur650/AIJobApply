import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import {
  deleteResume,
  markPrimaryResume,
  updateResumeTags,
} from "@/lib/resumes/service";
import { recordAuditLog } from "@/lib/security/audit";

const updateSchema = z.object({
  isPrimary: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  label: z.string().optional(),
});

export const PATCH = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const { userId } = await requireUser();
    const payload = await request.json();
    const parsed = updateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    if (parsed.data.isPrimary) {
      await markPrimaryResume(userId, params.id);
    }

    if (parsed.data.tags) {
      await updateResumeTags(userId, params.id, parsed.data.tags);
    }

    if (parsed.data.label) {
      await prisma.resume.update({
        where: { id: params.id, userId },
        data: { label: parsed.data.label },
      });
    }

    await recordAuditLog({
      userId,
      action: "resume.updated",
      resource: params.id,
      metadata: parsed.data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to update resume", error);
    return NextResponse.json(
      { error: "Unable to update resume" },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  _request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const { userId } = await requireUser();
    await deleteResume(userId, params.id);

    await recordAuditLog({
      userId,
      action: "resume.deleted",
      resource: params.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to delete resume", error);
    return NextResponse.json(
      { error: "Unable to delete resume" },
      { status: 500 }
    );
  }
};
