import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { listResumes, saveResume } from "@/lib/resumes/service";
import { recordAuditLog } from "@/lib/security/audit";

const uploadSchema = z.object({
  label: z.string().optional(),
  isPrimary: z.coerce.boolean().optional(),
  resumeId: z.string().optional(),
  tags: z.string().optional(),
});

export const GET = async () => {
  try {
    const { userId } = await requireUser();
    const resumes = await listResumes(userId);
    return NextResponse.json({ resumes });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to list resumes", error);
    return NextResponse.json({ error: "Unable to load resumes" }, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Resume file is required" },
        { status: 400 }
      );
    }

    const textFields: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (typeof value === "string") {
        textFields[key] = value;
      }
    });

    const parsedFields = uploadSchema.safeParse(textFields);

    if (!parsedFields.success) {
      return NextResponse.json(
        { error: parsedFields.error.flatten() },
        { status: 422 }
      );
    }

    const { userId } = await requireUser();

    const buffer = Buffer.from(await file.arrayBuffer());
    const tags = parsedFields.data.tags
      ? parsedFields.data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : undefined;

    const result = await saveResume({
      userId,
      file: {
        buffer,
        fileName: file.name,
        mimeType: file.type,
      },
      label: parsedFields.data.label,
      resumeId: parsedFields.data.resumeId,
      tags,
      isPrimary: parsedFields.data.isPrimary,
    });

    await recordAuditLog({
      userId,
      action: "resume.uploaded",
      resource: "resume",
      metadata: {
        resumeId: result.resumeId,
        label: parsedFields.data.label,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    console.error("Failed to upload resume", error);
    return NextResponse.json(
      { error: "Unable to upload resume" },
      { status: 500 }
    );
  }
};
