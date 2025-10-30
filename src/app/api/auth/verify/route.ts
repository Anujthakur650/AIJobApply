import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { consumeEmailVerificationToken } from "@/lib/auth/tokens";

const verifySchema = z.object({
  token: z.string().min(10),
});

export const POST = async (request: Request) => {
  const payload = await request.json();
  const parsed = verifySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const tokenRecord = await consumeEmailVerificationToken(parsed.data.token);

  if (!tokenRecord) {
    return NextResponse.json(
      { error: "Verification token is invalid or has expired" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: tokenRecord.identifier },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Account was not found for verification token" },
      { status: 404 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
    },
  });

  return NextResponse.json({ success: true });
};
