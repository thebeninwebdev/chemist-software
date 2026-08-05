import { MongoServerError } from "mongodb";
import { NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { buildDrugSearchText, cosineSimilarity, EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, escapeRegex, mergeHybridResults, normalizeSearchQuery, shouldRunSemanticSearch, stripEmbeddingFields, type SearchResult } from "@/lib/drug-search";
import { embedDrugDocument, embedSearchQuery } from "@/lib/server/embeddings";
import { connectToDatabase } from "@/lib/mongodb";
import DrugModel from "@/models/drug";
import { createDrugSchema, drugQuerySchema } from "@/lib/validations/drug.validation";

export const runtime = "nodejs";
const SEMANTIC_SCORE_MIN = Number(process.env.DRUG_SEMANTIC_SCORE_MIN ?? 0.6);
const LOCAL_VECTOR_CANDIDATE_LIMIT = Number(process.env.LOCAL_VECTOR_CANDIDATE_LIMIT ?? 2_000);
const publicDrug = (drug: Record<string, unknown>) => stripEmbeddingFields(drug);

async function localVectorSearch(baseFilter: Record<string, unknown>, queryVector: number[], limit: number): Promise<SearchResult[]> {
  const candidates = await DrugModel.find({ ...baseFilter, embedding: { $exists: true } })
    .select("+embedding")
    .limit(LOCAL_VECTOR_CANDIDATE_LIMIT)
    .lean();
  return candidates
    .map((drug) => {
      const record = drug as unknown as Record<string, unknown>;
      const embedding = record.embedding;
      const semanticScore = Array.isArray(embedding) && embedding.length === EMBEDDING_DIMENSIONS
        ? cosineSimilarity(queryVector, embedding as number[])
        : 0;
      return { ...record, semanticScore, matchType: "semantic" as const } as unknown as SearchResult;
    })
    .filter((drug) => Number(drug.semanticScore) >= SEMANTIC_SCORE_MIN)
    .sort((left, right) => Number(right.semanticScore) - Number(left.semanticScore))
    .slice(0, limit)
    .map((drug) => stripEmbeddingFields(drug) as SearchResult);
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const params = new URL(request.url).searchParams;
    const query = drugQuerySchema.parse({ search: params.get("search") || undefined, category: params.get("category") || undefined,
      dosageForm: params.get("dosageForm") || undefined, isAvailable: params.get("isAvailable") || undefined,
      page: params.get("page") || undefined, limit: params.get("limit") || undefined });
    const baseFilter: Record<string, unknown> = { isArchived: false };
    if (query.category) baseFilter.category = query.category;
    if (query.dosageForm) baseFilter.dosageForm = query.dosageForm;
    if (typeof query.isAvailable === "boolean") baseFilter.isAvailable = query.isAvailable;
    if (!query.search) {
      const skip = (query.page - 1) * query.limit;
      const [drugs, total] = await Promise.all([DrugModel.find(baseFilter).sort({ name: 1 }).skip(skip).limit(query.limit).lean(), DrugModel.countDocuments(baseFilter)]);
      return NextResponse.json({ success: true, data: drugs.map((drug) => publicDrug(drug as Record<string, unknown>)), pagination: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) } });
    }
    const term = normalizeSearchQuery(query.search);
    const escaped = escapeRegex(term);
    const exact = new RegExp(`^${escaped}$`, "i");
    const prefix = new RegExp(`^${escaped}`, "i");
    const keyword = new RegExp(escaped, "i");
    const fetchLimit = Math.min(query.page * query.limit, 100);
    const lexical = await DrugModel.aggregate<SearchResult>([
      { $match: { ...baseFilter, $or: [{ name: keyword }, { commonName: keyword }, { aliases: keyword }, { description: keyword }, { category: keyword }, { strength: keyword }] } },
      { $addFields: { _matchRank: { $switch: { branches: [
        { case: { $regexMatch: { input: "$name", regex: exact } }, then: 1 },
        { case: { $regexMatch: { input: { $ifNull: ["$commonName", ""] }, regex: exact } }, then: 2 },
        { case: { $anyElementTrue: { $map: { input: { $ifNull: ["$aliases", []] }, as: "alias", in: { $regexMatch: { input: "$$alias", regex: exact } } } } }, then: 3 },
        { case: { $or: [{ $regexMatch: { input: "$name", regex: prefix } }, { $regexMatch: { input: { $ifNull: ["$commonName", ""] }, regex: prefix } }] }, then: 4 },
      ], default: 5 } } } },
      { $sort: { _matchRank: 1, name: 1 } }, { $limit: fetchLimit },
      { $set: { matchType: { $cond: [{ $lte: ["$_matchRank", 3] }, "exact", "keyword"] } } },
      { $unset: ["_matchRank", "embedding", "searchText", "embeddingModel", "embeddingDimensions", "embeddingUpdatedAt"] },
    ]);
    let semantic: SearchResult[] = [];
    if (shouldRunSemanticSearch(term, lexical.length, fetchLimit)) {
      try {
        const queryVector = await embedSearchQuery(term);
        try {
          semantic = await DrugModel.aggregate<SearchResult>([
            { $vectorSearch: { index: "drug_semantic_search", path: "embedding", queryVector, numCandidates: Math.max(fetchLimit * 20, 100), limit: fetchLimit, filter: baseFilter } },
            { $set: { semanticScore: { $meta: "vectorSearchScore" }, matchType: "semantic" } },
            { $match: { semanticScore: { $gte: SEMANTIC_SCORE_MIN } } },
            { $unset: ["embedding", "searchText", "embeddingModel", "embeddingDimensions", "embeddingUpdatedAt"] },
          ]);
        } catch (error) {
          console.info(
            "Atlas Vector Search failed; using local cosine similarity.",
            error instanceof Error ? error.message : "Unknown error",
          );
          semantic = await localVectorSearch(baseFilter, queryVector, fetchLimit);
        }
      } catch (error) {
        console.error("Semantic drug search unavailable; returning lexical results.", error instanceof Error ? error.message : "Unknown error");
      }
    }
    const merged = mergeHybridResults([lexical, semantic], fetchLimit);
    const start = (query.page - 1) * query.limit;
    return NextResponse.json({ success: true, data: merged.slice(start, start + query.limit).map(publicDrug), pagination: { total: merged.length, page: query.page, limit: query.limit, totalPages: Math.ceil(merged.length / query.limit) } });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ success: false, message: "Invalid search parameters.", errors: error.flatten() }, { status: 400 });
    console.error("GET /api/drugs failed:", error);
    return NextResponse.json({ success: false, message: "Unable to retrieve drugs." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const validatedData = createDrugSchema.parse(await request.json());
    const existingDrug = await DrugModel.findOne({ name: { $regex: `^${escapeRegex(validatedData.name)}$`, $options: "i" }, strength: validatedData.strength, dosageForm: validatedData.dosageForm, isArchived: false }).lean();
    if (existingDrug) return NextResponse.json({ success: false, message: "A drug with the same name, strength, and dosage form already exists." }, { status: 409 });
    const searchText = buildDrugSearchText(validatedData);
    const embedding = await embedDrugDocument(searchText);
    const drug = await DrugModel.create({ ...validatedData, searchText, embedding, embeddingModel: EMBEDDING_MODEL, embeddingDimensions: EMBEDDING_DIMENSIONS, embeddingUpdatedAt: new Date() });
    return NextResponse.json({ success: true, message: "Drug created successfully.", data: publicDrug(drug.toObject()) }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ success: false, message: "Invalid drug information.", errors: z.treeifyError(error) }, { status: 400 });
    if (error instanceof MongoServerError && error.code === 11000) return NextResponse.json({ success: false, message: "A drug with this unique information already exists." }, { status: 409 });
    if (error instanceof SyntaxError) return NextResponse.json({ success: false, message: "The request body contains invalid JSON." }, { status: 400 });
    console.error("POST /api/drugs failed:", error);
    return NextResponse.json({ success: false, message: "Unable to create drug." }, { status: 500 });
  }
}
