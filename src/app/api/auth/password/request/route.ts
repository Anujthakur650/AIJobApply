import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { createPasswordResetToken } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/auth/mailer";

const requestSchema = z.object({
  email: z.string().email(),
});

export const POST = async (request: Request) => {
  const payload = await request.json();
  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ success: true });
  }

  const token = await createPasswordResetToken(user.id);
  await sendPasswordResetEmail(email, token.token, user.name ?? undefined);

  return NextResponse.json({ success: true });
};
