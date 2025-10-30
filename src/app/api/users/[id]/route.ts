import { NextResponse } from "next/server";
import { z } from "zod";
import { DataDeletionStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { updateProfileCompletion } from "@/lib/onboarding/service";
import { recordAuditLog } from "@/lib/security/audit";

const profileSchema = z.object({
  headline: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  yearsExperience: z.number().int().nullable().optional(),
  primaryRole: z.string().nullable().optional(),
});

const preferencesSchema = z.object({}).passthrough();

const updateSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  profile: profileSchema.optional(),
  preferences: preferencesSchema.optional(),
});

const deletionSchema = z.object({
  reason: z.string().max(500).optional(),
});

const canAccess = (currentUser: { id: string; role?: string }, targetId: string) =>
  currentUser.id === targetId || currentUser.role === "ADMIN";

export const GET = async (
  _request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const { userId, role } = await requireUser();

    if (!canAccess({ id: userId, role }, params.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        profile: {
          include: {
            experiences: true,
            education: true,
          },
        },
        skills: {
          include: { skill: true },
        },
        onboarding: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to fetch user", error);
    return NextResponse.json({ error: "Unable to load user" }, { status: 500 });
  }
};

export const PATCH = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const { userId, role } = await requireUser();

    if (!canAccess({ id: userId, role }, params.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    if (parsed.data.name || parsed.data.phone || parsed.data.timezone) {
      await prisma.user.update({
        where: { id: params.id },
        data: {
          ...(parsed.data.name ? { name: parsed.data.name } : {}),
          ...(parsed.data.phone ? { phone: parsed.data.phone } : {}),
          ...(parsed.data.timezone ? { timezone: parsed.data.timezone } : {}),
        },
      });
    }

    if (parsed.data.profile) {
      await prisma.userProfile.upsert({
        where: { userId: params.id },
        update: parsed.data.profile,
        create: {
          userId: params.id,
          ...parsed.data.profile,
        },
      });
    }

    if (parsed.data.preferences) {
      await prisma.userProfile.updateMany({
        where: { userId: params.id },
        data: { preferenceSettings: parsed.data.preferences },
      });
    }

    const snapshot = await updateProfileCompletion(params.id);

    await recordAuditLog({
      userId: params.id,
      action: "user.profile_updated",
      resource: "user",
      metadata: parsed.data,
    });

    return NextResponse.json({ success: true, snapshot });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to update user", error);
    return NextResponse.json({ error: "Unable to update user" }, { status: 500 });
  }
};

export const DELETE = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const { userId, role } = await requireUser();

    if (!canAccess({ id: userId, role }, params.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let parsed = { reason: undefined as string | undefined };

    if (request.headers.get("content-type")?.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      const result = deletionSchema.safeParse(body ?? {});
      if (result.success) {
        parsed = result.data;
      }
    }

    const deletion = await prisma.dataDeletionRequest.create({
      data: {
        userId: params.id,
        status: DataDeletionStatus.PENDING,
        reason: parsed.reason ?? null,
        metadata: {
          requestedBy: userId,
          role,
        },
      },
    });

    await recordAuditLog({
      userId,
      action: "user.deletion_requested",
      resource: params.id,
      metadata: { requestId: deletion.id, reason: parsed.reason },
    });

    return NextResponse.json({ request: deletion });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to request data deletion", error);
    return NextResponse.json(
      { error: "Unable to request deletion" },
      { status: 500 }
    );
  }
};
