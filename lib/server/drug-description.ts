import "server-only";

import { GoogleGenAI } from "@google/genai";

type DrugDescriptionInput = { name: string; commonName?: string; category?: string; dosageForm?: string; strength?: string; manufacturer?: string };
const MODEL = process.env.GEMINI_DESCRIPTION_MODEL ?? "gemini-flash-latest";
const TIMEOUT_MS = Number(process.env.GEMINI_DESCRIPTION_TIMEOUT_MS ?? 30_000);

export async function generateDrugDescription(drug: DrugDescriptionInput): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");
  const details = Object.entries(drug).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`).join("\n");
  const request = new GoogleGenAI({ apiKey }).models.generateContent({
    model: MODEL,
    contents: `Write one concise, factual inventory-catalogue description (40-70 words) for this medicine:\n${details}\n\nDescribe identifying information and common product classification only. Do not diagnose, recommend treatment, prescribe dosage, claim suitability, or invent missing facts. Return only the description.`,
    // Current Flash models may use part of this allowance internally before
    // producing visible text, so leave enough room for the requested response.
    config: { temperature: 0.2, maxOutputTokens: 1_024 },
  });
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const response = await Promise.race([request, new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error("Description request timed out.")), TIMEOUT_MS);
    })]);
    const description = response.text?.trim();
    if (!description) throw new Error("Gemini returned an empty description.");
    return description.slice(0, 2_000);
  } finally { if (timeout) clearTimeout(timeout); }
}
