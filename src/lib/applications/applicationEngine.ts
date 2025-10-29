import { z } from "zod";

const fieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(["text", "textarea", "select", "checkbox", "file", "email", "tel"]),
  required: z.boolean().default(false),
});

const formSchema = z.object({
  url: z.string().url(),
  fields: z.array(fieldSchema),
});

const profileSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  resumeUrl: z.string().optional(),
  coverLetter: z.string().optional(),
  links: z.record(z.string().url()).optional(),
  answers: z.record(z.string()).optional(),
});

export type ApplicationForm = z.infer<typeof formSchema>;
export type ApplicationProfile = z.infer<typeof profileSchema>;

export type SubmissionPlan = {
  url: string;
  fieldValues: Record<string, string | boolean>;
  fileUploads: Record<string, string>;
  missingRequiredFields: string[];
};

const fieldSynonyms: Record<string, string[]> = {
  firstName: ["first_name", "firstname", "givenName"],
  lastName: ["last_name", "lastname", "surname"],
  email: ["email", "email_address", "emailAddress"],
  phone: ["phone", "phone_number", "telephone"],
  location: ["location", "city", "address"],
  resume: ["resume", "cv", "resume_upload"],
  coverLetter: ["cover_letter", "coverletter", "motivation"],
  linkedin: ["linkedin", "linkedin_profile"],
  github: ["github", "github_profile"],
  portfolio: ["portfolio", "website"],
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const resolveFieldKey = (field: ApplicationForm["fields"][number]) => {
  const normalized = normalize(field.name || field.label);

  for (const [key, synonyms] of Object.entries(fieldSynonyms)) {
    if (normalize(key) === normalized || synonyms.some((item) => normalize(item) === normalized)) {
      return key;
    }
  }

  return normalized;
};

const deriveFieldValue = (
  resolvedKey: string,
  profile: ApplicationProfile
): string | boolean | null => {
  switch (resolvedKey) {
    case "firstname":
    case "firstName":
      return profile.firstName;
    case "lastname":
    case "lastName":
      return profile.lastName;
    case "email":
      return profile.email;
    case "phone":
      return profile.phone ?? null;
    case "location":
      return profile.location ?? null;
    case "coverletter":
    case "coverLetter":
      return profile.coverLetter ?? null;
    case "linkedin":
      return profile.links?.linkedin ?? null;
    case "github":
      return profile.links?.github ?? null;
    case "portfolio":
      return profile.links?.portfolio ?? null;
    default:
      return profile.answers?.[resolvedKey] ?? null;
  }
};

export const buildSubmissionPlan = (
  form: ApplicationForm,
  profile: ApplicationProfile
): SubmissionPlan => {
  const parsedForm = formSchema.parse(form);
  const parsedProfile = profileSchema.parse(profile);

  const fieldValues: SubmissionPlan["fieldValues"] = {};
  const fileUploads: SubmissionPlan["fileUploads"] = {};
  const missingRequiredFields: string[] = [];

  parsedForm.fields.forEach((field) => {
    const resolvedKey = resolveFieldKey(field);
    const value = deriveFieldValue(resolvedKey, parsedProfile);

    if (field.type === "file") {
      if (resolvedKey.includes("resume") && parsedProfile.resumeUrl) {
        fileUploads[field.name] = parsedProfile.resumeUrl;
      } else if (resolvedKey.includes("cover") && parsedProfile.coverLetter) {
        fileUploads[field.name] = parsedProfile.coverLetter;
      } else if (field.required) {
        missingRequiredFields.push(field.name);
      }
      return;
    }

    if (typeof value === "string" && value.length) {
      fieldValues[field.name] = value;
      return;
    }

    if (typeof value === "boolean") {
      fieldValues[field.name] = value;
      return;
    }

    if (field.required) {
      missingRequiredFields.push(field.name);
    }
  });

  return {
    url: parsedForm.url,
    fieldValues,
    fileUploads,
    missingRequiredFields,
  };
};
