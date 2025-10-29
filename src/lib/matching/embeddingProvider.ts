import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { Pinecone } from "@pinecone-database/pinecone";
import { getEnv } from "@/lib/config/env";

export type EmbeddingModel = "openai" | "anthropic";

export type EmbeddingResponse = {
  vector: number[];
  model: EmbeddingModel;
};

const env = getEnv();

const getOpenAIClient = () => {
  if (!env.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
};

const getAnthropicClient = () => {
  if (!env.ANTHROPIC_API_KEY) {
    return null;
  }

  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
};

export const generateEmbedding = async (
  content: string,
  preferredModel: EmbeddingModel = "openai"
): Promise<EmbeddingResponse | null> => {
  if (preferredModel === "anthropic") {
    const client = getAnthropicClient();

    if (!client) {
      return null;
    }

    const response = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1,
      system: "Return only embeddings as a comma separated list of floats",
      temperature: 0,
      messages: [{ role: "user", content }],
    });

    const vector = response.content
      .filter((item) => item.type === "text")
      .flatMap((item) => item.text.split(","))
      .map((entry) => Number.parseFloat(entry.trim()))
      .filter((value) => Number.isFinite(value));

    return { vector, model: "anthropic" };
  }

  const client = getOpenAIClient();

  if (!client) {
    return null;
  }

  const embedding = await client.embeddings.create({
    model: "text-embedding-3-large",
    input: content,
  });

  return {
    vector: embedding.data[0]?.embedding ?? [],
    model: "openai",
  };
};

export const upsertEmbedding = async (
  id: string,
  vector: number[],
  metadata: Record<string, string>
) => {
  if (
    !env.VECTOR_DB_API_KEY ||
    !env.VECTOR_DB_INDEX ||
    !env.VECTOR_DB_ENVIRONMENT
  ) {
    return;
  }

  const pinecone = new Pinecone({
    apiKey: env.VECTOR_DB_API_KEY,
    environment: env.VECTOR_DB_ENVIRONMENT,
  });

  const index = pinecone.Index(env.VECTOR_DB_INDEX);

  await index.upsert([{ id, values: vector, metadata }]);
};
