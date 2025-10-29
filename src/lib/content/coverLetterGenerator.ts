import OpenAI from "openai";
import { getEnv } from "@/lib/config/env";

export type CoverLetterInput = {
  jobTitle: string;
  company: string;
  jobDescription: string;
  userSummary: string;
  achievements: string[];
  tone?: "professional" | "enthusiastic" | "friendly";
};

export type CoverLetterOutput = {
  content: string;
  tokensUsed?: number;
  provider: "openai" | "template";
};

const templateGenerator = (input: CoverLetterInput): CoverLetterOutput => {
  const { jobTitle, company, achievements, userSummary, jobDescription, tone } = input;

  const toneDescriptors: Record<string, string> = {
    professional: "I approach my work with diligence and professionalism.",
    enthusiastic: "I am excited about the opportunity to contribute immediately.",
    friendly: "I value building strong partnerships with my teammates and stakeholders.",
  };

  const descriptor = tone ? toneDescriptors[tone] : toneDescriptors.professional;

  const achievementList = achievements.map((item) => `• ${item}`).join("\n");

  const content = `Dear Hiring Team at ${company},\n\nI am writing to express my interest in the ${jobTitle} position. ${userSummary}\n\n${descriptor}\n\nKey achievements that demonstrate my fit include:\n${achievementList}\n\nWhat excites me about ${company}:\n${jobDescription.slice(0, 300)}...\n\nThank you for your consideration. I look forward to the opportunity to discuss how I can deliver results for ${company}.\n\nSincerely,\nAIJobApply Candidate`;

  return {
    content,
    provider: "template",
  };
};

export const generateCoverLetter = async (
  input: CoverLetterInput
): Promise<CoverLetterOutput> => {
  const env = getEnv();

  if (!env.OPENAI_API_KEY) {
    return templateGenerator(input);
  }

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const prompt = `Write a ${input.tone ?? "professional"} cover letter for the role "${input.jobTitle}" at ${input.company}. Use the following achievements and summary: ${input.achievements.join(", ")} | ${input.userSummary}. Focus on the job description: ${input.jobDescription}`;

  const completion = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
    max_output_tokens: 800,
    temperature: 0.7,
  });

  const content = completion.output_text;
  const tokensUsed = completion.usage?.total_tokens;

  if (!content) {
    return templateGenerator(input);
  }

  return {
    content,
    tokensUsed,
    provider: "openai",
  };
};
