import mongoose from "mongoose";
import { buildDrugSearchText, EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "../lib/drug-search";
import { embedDrugDocument } from "../lib/server/embeddings";
import { connectToDatabase } from "../lib/mongodb";
import DrugModel from "../models/drug";

function option(name: string) {
  const match = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (match) return match.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const force = process.argv.includes("--force");
  const batchSize = Number(option("--batch-size") ?? 25);
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 100) {
    throw new Error("--batch-size must be an integer between 1 and 100.");
  }
  await connectToDatabase();
  const filter = force ? {} : { $or: [
    { embedding: { $exists: false } }, { embedding: { $size: 0 } },
    { embeddingModel: { $ne: EMBEDDING_MODEL } },
    { embeddingDimensions: { $ne: EMBEDDING_DIMENSIONS } },
  ] };
  const total = await DrugModel.countDocuments({});
  let processed = 0, successful = 0, failed = 0;
  const cursor = DrugModel.find(filter).select("+embedding +embeddingModel +embeddingDimensions").cursor({ batchSize });
  for await (const drug of cursor) {
    processed++;
    try {
      const searchText = buildDrugSearchText(drug.toObject());
      const embedding = await embedDrugDocument(searchText);
      await DrugModel.updateOne({ _id: drug._id }, { $set: { searchText, embedding, embeddingModel: EMBEDDING_MODEL,
        embeddingDimensions: EMBEDDING_DIMENSIONS, embeddingUpdatedAt: new Date() } });
      successful++;
    } catch (error) {
      failed++;
      console.error(`Failed drug ${drug._id}:`, error instanceof Error ? error.message : "Unknown error");
    }
  }
  console.log({ processed, successful, failed, skipped: total - processed });
}

main().catch((error) => { console.error("Backfill failed:", error instanceof Error ? error.message : "Unknown error"); process.exitCode = 1; })
  .finally(async () => { await mongoose.disconnect(); });
