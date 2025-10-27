import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Please enter your full name').max(120),
    email: z.string().email('Please provide a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(64, 'Password must be fewer than 64 characters'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export const signInSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const experienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(2),
  title: z.string().min(2),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  current: z.boolean().default(false),
  location: z.string().optional(),
  description: z.string().optional(),
  achievements: z.array(z.string()).default([])
});

export const educationSchema = z.object({
  id: z.string().optional(),
  school: z.string().min(2),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  description: z.string().optional()
});

export const certificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  authority: z.string().optional(),
  issuedOn: z.string().nullable().optional(),
  expiresOn: z.string().nullable().optional(),
  url: z.string().url().nullable().optional()
});

export const skillSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  category: z.string().optional(),
  seniority: z.string().optional(),
  years: z.number().int().min(0).max(50).optional()
});

export const preferenceSchema = z.object({
  employmentType: z.array(z.string()).default([]),
  workModes: z.array(z.string()).default([]),
  locations: z.array(z.string()).default([]),
  industries: z.array(z.string()).default([]),
  companySizes: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  salaryMin: z.number().int().nonnegative().nullable().optional(),
  salaryMax: z.number().int().nonnegative().nullable().optional(),
  remoteOnly: z.boolean().default(false)
});

export const profileUpdateSchema = z.object({
  profile: z
    .object({
      headline: z.string().nullable().optional(),
      summary: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      location: z.string().nullable().optional(),
      website: z.string().url().nullable().optional(),
      linkedin: z.string().url().nullable().optional(),
      github: z.string().url().nullable().optional(),
      portfolio: z.string().url().nullable().optional(),
      yearsOfExperience: z.number().int().min(0).max(50).nullable().optional()
    })
    .optional(),
  preferences: preferenceSchema.optional(),
  experiences: z.array(experienceSchema).optional(),
  educations: z.array(educationSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  skills: z.array(skillSchema).optional()
});

export const resumeUploadSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  notes: z.string().max(600).optional()
});

export const applicationCreateSchema = z.object({
  jobPostingId: z.string().min(1),
  campaignId: z.string().optional(),
  resumeDocumentId: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().max(600).optional()
});

export const campaignCreateSchema = z.object({
  name: z.string().min(2).max(120),
  targetTitles: z.array(z.string()).default([]),
  targetLocations: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  dailyLimit: z.number().int().min(1).max(200).default(10),
  workModes: z.array(z.string()).default([]),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional()
});
