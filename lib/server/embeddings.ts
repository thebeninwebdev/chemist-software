import "server-only";

import { GoogleGenAI } from "@google/genai";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, validateEmbedding } from "@/lib/drug-search";

const EMBEDDING_TIMEOUT_MS = Number(process.env.GEMINI_EMBEDDING_TIMEOUT_MS ?? 10_000);

async function embed(text: string, taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");
  const ai = new GoogleGenAI({ apiKey });
  const request = ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: { outputDimensionality: EMBEDDING_DIMENSIONS, taskType },
  });
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const response = await Promise.race([
      request,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Embedding request timed out.")), EMBEDDING_TIMEOUT_MS);
      }),
    ]);
    return validateEmbedding(response.embeddings?.[0]?.values);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export const embedDrugDocument = (text: string) => embed(text, "RETRIEVAL_DOCUMENT");
export const embedSearchQuery = (text: string) => embed(text, "RETRIEVAL_QUERY");
