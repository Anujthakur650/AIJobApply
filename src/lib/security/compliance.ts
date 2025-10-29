import { z } from "zod";

const consentSchema = z.object({
  userId: z.string(),
  consentType: z.enum(["gdpr", "ccpa", "email_marketing", "data_processing"]),
  grantedAt: z.date(),
  expiresAt: z.date().nullable(),
  metadata: z.record(z.any()).optional(),
});

export type ConsentRecord = z.infer<typeof consentSchema>;

export const validateConsent = (records: ConsentRecord[]) => {
  const now = new Date();
  return records.every((record) => {
    const parsed = consentSchema.parse(record);
    if (!parsed.expiresAt) {
      return true;
    }

    return parsed.expiresAt > now;
  });
};

export const sanitizeUserData = <T extends Record<string, unknown>>(payload: T) => {
  const sanitized = { ...payload };
  if ("ssn" in sanitized) {
    delete sanitized.ssn;
  }

  if ("password" in sanitized) {
    delete sanitized.password;
  }

  return sanitized;
};
