import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import {
  createEmailVerificationToken,
} from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/auth/mailer";
import { recordAuditLog, recordConsent } from "@/lib/security/audit";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(120),
});

export const POST = async (request: Request) => {
  try {
    const payload = await request.json();
    const parsed = registerSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const hashedPassword = await hashPassword(parsed.data.password);

    const user = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email } });

      if (existing && existing.emailVerified) {
        throw new Error("EMAIL_ALREADY_VERIFIED");
      }

      const updatedUser = existing
        ? await tx.user.update({
            where: { id: existing.id },
            data: {
              name: parsed.data.name,
              passwordHash: hashedPassword,
            },
          })
        : await tx.user.create({
            data: {
              email,
              name: parsed.data.name,
              passwordHash: hashedPassword,
              profile: {
                create: {},
              },
              onboarding: {
                create: {},
              },
            },
          });

      await tx.userProfile.upsert({
        where: { userId: updatedUser.id },
        update: {},
        create: { userId: updatedUser.id },
      });

      await tx.onboardingProgress.upsert({
        where: { userId: updatedUser.id },
        update: {},
        create: { userId: updatedUser.id },
      });

      return updatedUser;
    });

    const verification = await createEmailVerificationToken(email);
    await sendVerificationEmail(email, verification.token, user.name ?? undefined);

    await recordAuditLog({
      userId: user.id,
      action: "user.registered",
      resource: "user",
      metadata: { email },
    });
    await recordConsent(user.id, "terms_of_service", true, {
      method: "self-service",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_VERIFIED") {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    console.error("Registration error", error);
    return NextResponse.json(
      { error: "Unable to complete registration" },
      { status: 500 }
    );
  }
};
