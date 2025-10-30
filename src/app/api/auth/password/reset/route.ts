import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { consumePasswordResetToken } from "@/lib/auth/tokens";
import { hashPassword } from "@/lib/auth/password";

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128),
});

export const POST = async (request: Request) => {
  const payload = await request.json();
  const parsed = resetSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const tokenRecord = await consumePasswordResetToken(parsed.data.token);

  if (!tokenRecord) {
    return NextResponse.json(
      { error: "Reset token is invalid or expired" },
      { status: 400 }
    );
  }

  const hashed = await hashPassword(parsed.data.password);

  await prisma.user.update({
    where: { id: tokenRecord.userId },
    data: {
      passwordHash: hashed,
      emailVerified: new Date(),
    },
  });

  return NextResponse.json({ success: true });
};
