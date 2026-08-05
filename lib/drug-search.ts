export const EMBEDDING_MODEL = "gemini-embedding-2";
export const EMBEDDING_DIMENSIONS = 768;

export function validateEmbedding(values: unknown): number[] {
  if (!Array.isArray(values) || values.length !== EMBEDDING_DIMENSIONS ||
      !values.every((value) => typeof value === "number" && Number.isFinite(value))) {
    throw new Error(`Embedding must contain exactly ${EMBEDDING_DIMENSIONS} finite numbers.`);
  }
  return values;
}

export function cosineSimilarity(left: number[], right: number[]): number {
  if (left.length !== right.length || left.length === 0) return 0;
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  for (let index = 0; index < left.length; index++) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] ** 2;
    rightMagnitude += right[index] ** 2;
  }
  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);
  return denominator === 0 ? 0 : dot / denominator;
}

export async function withSemanticFallback<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try { return await operation(); } catch { return fallback; }
}

export type SemanticDrugFields = {
  name?: string;
  commonName?: string | null;
  brandName?: string | null;
  aliases?: string[] | null;
  category?: string | null;
  dosageForm?: string | null;
  description?: string | null;
  uses?: string[] | string | null;
  activeIngredients?: string[] | string | null;
  strength?: string | null;
};

const semanticFields = [
  "name", "commonName", "brandName", "aliases", "category", "dosageForm",
  "description", "uses", "activeIngredients", "strength",
] as const;

function clean(value: unknown): string {
  return (Array.isArray(value) ? value.join(", ") : String(value ?? ""))
    .trim()
    .replace(/\s+/g, " ");
}

export function buildDrugSearchText(drug: SemanticDrugFields): string {
  const labels: Record<(typeof semanticFields)[number], string> = {
    name: "Drug name", commonName: "Common name", brandName: "Brand name",
    aliases: "Aliases", category: "Category", dosageForm: "Dosage form",
    description: "Description", uses: "Uses", activeIngredients: "Active ingredients",
    strength: "Strength",
  };

  return semanticFields
    .map((field) => [labels[field], clean(drug[field])] as const)
    .filter(([, value]) => value.length > 0)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}

export function hasSemanticFieldChanges(update: Record<string, unknown>): boolean {
  return semanticFields.some((field) => Object.prototype.hasOwnProperty.call(update, field));
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeSearchQuery(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, 200);
}

export function shouldRunSemanticSearch(query: string, lexicalCount: number, limit: number): boolean {
  return normalizeSearchQuery(query).length >= 2 && lexicalCount < limit;
}

export type SearchResult = Record<string, unknown> & {
  _id: unknown;
  matchType: "exact" | "keyword" | "semantic";
};

export function mergeHybridResults(groups: SearchResult[][], limit: number): SearchResult[] {
  const seen = new Set<string>();
  const merged: SearchResult[] = [];
  for (const group of groups) {
    for (const drug of group) {
      const id = String(drug._id);
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(drug);
        if (merged.length === limit) return merged;
      }
    }
  }
  return merged;
}

export function stripEmbeddingFields<T extends Record<string, unknown>>(drug: T) {
  const safe: Record<string, unknown> = { ...drug };
  for (const field of ["embedding", "searchText", "embeddingModel", "embeddingDimensions", "embeddingUpdatedAt", "semanticScore"]) {
    delete safe[field];
  }
  return safe;
}
