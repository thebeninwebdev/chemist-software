import assert from "node:assert/strict";
import test from "node:test";
import { buildDrugSearchText, buildLexicalSearchTerms, cosineSimilarity, escapeRegex, hasSemanticFieldChanges, mergeHybridResults,
  normalizeSearchQuery, shouldRunSemanticSearch, stripEmbeddingFields, validateEmbedding,
  withSemanticFallback } from "../lib/drug-search";

test("search text uses semantic fields and excludes inventory fields", () => {
  const text = buildDrugSearchText({ name: "Panadol", commonName: "Paracetamol", description: "Pain relief", strength: "500 mg" });
  assert.match(text, /Panadol/); assert.match(text, /Paracetamol/); assert.doesNotMatch(text, /price|quantity|location/i);
});
test("regex escaping and query normalization", () => {
  assert.equal(escapeRegex("a+b?"), "a\\+b\\?"); assert.equal(normalizeSearchQuery("  pain   relief "), "pain relief");
});
test("lexical fallback extracts useful words from natural-language searches", () => {
  assert.deepEqual(buildLexicalSearchTerms("medicine for headache"), ["medicine for headache", "headache"]);
  assert.deepEqual(buildLexicalSearchTerms("  FOR the medicine  "), ["FOR the medicine"]);
});
test("hybrid merge removes duplicates and keeps exact priority", () => {
  const exact = { _id: "1", matchType: "exact" as const };
  const semantic = { _id: "1", matchType: "semantic" as const };
  assert.deepEqual(mergeHybridResults([[exact], [semantic, { _id: "2", matchType: "semantic" }]], 5), [exact, { _id: "2", matchType: "semantic" }]);
});
test("semantic search skips short queries and full lexical pages", () => {
  assert.equal(shouldRunSemanticSearch("a", 0, 8), false); assert.equal(shouldRunSemanticSearch("pain", 8, 8), false); assert.equal(shouldRunSemanticSearch("pain", 2, 8), true);
});
test("embedding validation requires 768 finite numbers", () => {
  assert.equal(validateEmbedding(Array(768).fill(0)).length, 768); assert.throws(() => validateEmbedding([1]));
});
test("cosine similarity ranks identical vectors highest", () => {
  assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
});
test("semantic failure falls back", async () => {
  assert.deepEqual(await withSemanticFallback(async () => { throw new Error("Gemini unavailable"); }, ["lexical"]), ["lexical"]);
});
test("internal embedding fields are stripped", () => {
  assert.deepEqual(stripEmbeddingFields({ _id: "1", name: "Drug", embedding: [1], searchText: "x", embeddingModel: "x", embeddingDimensions: 1, embeddingUpdatedAt: new Date(), semanticScore: 0.9 }), { _id: "1", name: "Drug" });
});
test("semantic updates are selective", () => {
  assert.equal(hasSemanticFieldChanges({ prices: [] }), false); assert.equal(hasSemanticFieldChanges({ description: "new" }), true); assert.equal(hasSemanticFieldChanges({ uses: ["pain"] }), true);
});
