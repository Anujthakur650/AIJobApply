import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { reorderApplications } from "@/lib/applications/service";

const schema = z.object({
  order: z.array(z.string()).min(1),
});

export const PATCH = async (request: Request) => {
  try {
    const payload = await request.json();
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { userId } = await requireUser();
    await reorderApplications(userId, parsed.data.order);

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to reorder applications", error);
    return NextResponse.json(
      { error: "Unable to reorder applications" },
      { status: 500 }
    );
  }
};
