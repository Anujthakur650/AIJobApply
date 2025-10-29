import { PrismaClient } from "@prisma/client";
import { getEnv } from "@/lib/config/env";

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

const { isProduction } = getEnv();

const prismaClient = global.__prisma__ ??
  new PrismaClient({
    log: isProduction
      ? ["error"]
      : ["query", "error", "warn"],
  });

if (!isProduction) {
  global.__prisma__ = prismaClient;
}

export const prisma = prismaClient;
