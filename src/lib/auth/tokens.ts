import { randomBytes } from "crypto";
import { addHours, isBefore } from "date-fns";
import { prisma } from "@/lib/db/prisma";

const DEFAULT_VERIFICATION_EXPIRY_HOURS = 24;
const DEFAULT_PASSWORD_RESET_EXPIRY_HOURS = 2;

const generateToken = (bytes = 32) => randomBytes(bytes).toString("hex");

export const createEmailVerificationToken = async (email: string) => {
  const token = generateToken();

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  return prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: addHours(new Date(), DEFAULT_VERIFICATION_EXPIRY_HOURS),
    },
  });
};

export const consumeEmailVerificationToken = async (token: string) => {
  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record) {
    return null;
  }

  if (isBefore(record.expires, new Date())) {
    await prisma.verificationToken.delete({ where: { token } });
    return null;
  }

  await prisma.verificationToken.delete({ where: { token } });
  return record;
};

export const createPasswordResetToken = async (userId: string) => {
  const token = generateToken();

  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  return prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expires: addHours(new Date(), DEFAULT_PASSWORD_RESET_EXPIRY_HOURS),
    },
  });
};

export const consumePasswordResetToken = async (token: string) => {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!record) {
    return null;
  }

  if (isBefore(record.expires, new Date())) {
    await prisma.passwordResetToken.delete({ where: { token } });
    return null;
  }

  await prisma.passwordResetToken.delete({ where: { token } });
  return record;
};
