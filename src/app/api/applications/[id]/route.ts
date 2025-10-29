import { NextResponse } from "next/server";
import { z } from "zod";
import { ApplicationStatus } from "@prisma/client";
import { requireUser } from "@/lib/auth/session";
import {
  addApplicationNote,
  getApplication,
  updateApplicationStatus,
} from "@/lib/applications/service";

const updateSchema = z.object({
  status: z.nativeEnum(ApplicationStatus).optional(),
  note: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const GET = async (
  _request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const { userId } = await requireUser();
    const application = await getApplication(userId, params.id);

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to fetch application", error);
    return NextResponse.json({ error: "Unable to load application" }, { status: 500 });
  }
};

export const PATCH = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const payload = await request.json();
    const parsed = updateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { userId } = await requireUser();

    if (parsed.data.status) {
      await updateApplicationStatus(
        userId,
        params.id,
        parsed.data.status,
        parsed.data.metadata ?? null
      );
    }

    if (parsed.data.note) {
      await addApplicationNote(userId, params.id, parsed.data.note);
    }

    const application = await getApplication(userId, params.id);
    return NextResponse.json({ application });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to update application", error);
    return NextResponse.json(
      { error: "Unable to update application" },
      { status: 500 }
    );
  }
};
