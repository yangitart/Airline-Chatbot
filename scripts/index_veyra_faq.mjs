import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogDir = path.join(root, "src", "features", "faqs", "data");
const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
const isPublish = process.argv.includes("--publish");
const isDryRun = process.argv.includes("--dry-run");
const embeddingDimensions = 1536;
const embeddingBatchSize = 32;

if (isPublish === isDryRun) {
  throw new Error("Choose exactly one mode: --dry-run or --publish.");
}

async function loadCatalog(language) {
  const fileName = `veyra-faq.${language}.json`;
  const catalog = JSON.parse(await readFile(path.join(catalogDir, fileName), "utf8"));
  if (!catalog || typeof catalog !== "object" || Array.isArray(catalog) || Object.keys(catalog).length !== 21) {
    throw new Error(`${fileName} must contain all 21 FAQ categories.`);
  }

  const documents = [];
  const chunks = [];
  for (const [category, article] of Object.entries(catalog)) {
    if (!article.title || !article.overview || !Array.isArray(article.sections) || article.sections.length === 0) {
      throw new Error(`Invalid FAQ article: ${language}/${category}`);
    }
    const articleHash = createHash("sha256").update(JSON.stringify(article)).digest("hex");
    const documentId = `${language}-${category}`;
    documents.push({
      id: documentId,
      title: article.title,
      source_url: `veyra://faq/${language}/${category}`,
      source_category: category,
      source_type: "authored_faq",
      language,
      content_hash: articleHash,
    });

    let chunkIndex = 0;
    for (const section of article.sections) {
      if (!section.title || !Array.isArray(section.entries) || section.entries.length === 0) {
        throw new Error(`Invalid FAQ section: ${language}/${category}/${section.id}`);
      }
      for (const entry of section.entries) {
        if (!entry.question?.trim() || !entry.answer?.trim()) {
          throw new Error(`FAQ question or answer is empty: ${language}/${category}/${section.id}`);
        }
        const content = `Question: ${entry.question.trim()}\nAnswer: ${entry.answer.trim()}`;
        if (content.length > 6000) throw new Error(`FAQ entry exceeds the 6,000 character limit: ${documentId}`);
        chunks.push({
          document_id: documentId,
          chunk_index: chunkIndex++,
          section_title: section.title,
          content,
        });
      }
    }
  }
  return { documents, chunks };
}

async function requestEmbeddings(inputs, apiKey) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    let response;
    try {
      response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        signal: AbortSignal.timeout(45_000),
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: embeddingModel, dimensions: embeddingDimensions, input: inputs, encoding_format: "float" }),
      });
    } catch (error) {
      if (attempt === 3) throw new Error(`OpenAI embeddings request failed: ${error instanceof Error ? error.name : "network_error"}`);
      await new Promise((resolve) => setTimeout(resolve, 500 * (2 ** attempt)));
      continue;
    }

    if (response.ok) {
      const payload = await response.json();
      if (!Array.isArray(payload.data) || payload.data.length !== inputs.length) {
        throw new Error("OpenAI returned an incomplete embedding batch.");
      }
      const ordered = [...payload.data].sort((a, b) => a.index - b.index);
      return ordered.map((item) => {
        if (!Array.isArray(item.embedding) || item.embedding.length !== embeddingDimensions
          || item.embedding.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
          throw new Error("OpenAI returned an invalid FAQ embedding.");
        }
        return item.embedding;
      });
    }

    if (response.status !== 429 && response.status < 500) {
      throw new Error(`OpenAI embeddings request rejected (${response.status}). Check the API key, billing and model access.`);
    }
    if (attempt === 3) throw new Error(`OpenAI embeddings request failed after retries (${response.status}).`);
    await new Promise((resolve) => setTimeout(resolve, 500 * (2 ** attempt)));
  }
  throw new Error("OpenAI embeddings request failed.");
}

async function createEmbeddings(chunks, apiKey) {
  const result = [];
  for (let start = 0; start < chunks.length; start += embeddingBatchSize) {
    const batch = chunks.slice(start, start + embeddingBatchSize);
    const embeddings = await requestEmbeddings(batch.map((chunk) => chunk.content), apiKey);
    result.push(...batch.map((chunk, index) => ({ ...chunk, embedding: embeddings[index] })));
    process.stdout.write(`Embedded ${Math.min(start + batch.length, chunks.length)}/${chunks.length} FAQ entries\n`);
  }
  return result;
}

async function insertInBatches(client, table, rows, batchSize = 50) {
  for (let start = 0; start < rows.length; start += batchSize) {
    const { error } = await client.from(table).insert(rows.slice(start, start + batchSize));
    if (error) throw new Error(`Could not insert ${table} batch: ${error.code || "database_error"}`);
  }
}

const english = await loadCatalog("en");
const spanish = await loadCatalog("es");
const documents = [...english.documents, ...spanish.documents];
const chunks = [...english.chunks, ...spanish.chunks];
const chunkCounts = {
  en: english.chunks.length,
  es: spanish.chunks.length,
};

console.log(`Validated Veyra FAQ catalog: ${documents.length} documents, ${chunks.length} Q&A chunks (${chunkCounts.en} EN, ${chunkCounts.es} ES).`);
console.log(`Embedding model: ${embeddingModel} (${embeddingDimensions} dimensions).`);

if (isDryRun) {
  console.log("Dry run only. No API calls or Supabase writes were made.");
  process.exit(0);
}

const openAiKey = process.env.OPENAI_API_KEY?.trim();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!openAiKey || !supabaseUrl || !supabaseSecretKey) {
  throw new Error("Publishing needs OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or the legacy SUPABASE_SERVICE_ROLE_KEY) in the local environment.");
}

const embeddedChunks = await createEmbeddings(chunks, openAiKey);
const admin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: version, error: versionError } = await admin.from("faq_corpus_versions")
  .insert({
    status: "staging",
    expected_documents: documents.length,
    expected_chunks: embeddedChunks.length,
    embedding_model: embeddingModel,
  })
  .select("id")
  .single();
if (versionError || !version?.id) {
  throw new Error(`Could not create a staging FAQ version: ${versionError?.code || "database_error"}`);
}

console.log(`Created staging FAQ corpus ${version.id}.`);
try {
  await insertInBatches(admin, "faq_documents", documents.map((document) => ({ ...document, version_id: version.id })));
  await insertInBatches(admin, "faq_chunks", embeddedChunks.map((chunk) => ({ ...chunk, version_id: version.id })));
  const { error: publishError } = await admin.rpc("publish_faq_corpus_version", { p_version_id: version.id });
  if (publishError) throw new Error(`Could not publish FAQ corpus: ${publishError.code || "database_error"}`);
} catch (error) {
  console.error(`The corpus remains in staging and was not made searchable (version ${version.id}).`);
  throw error;
}

console.log(`Published Veyra FAQ corpus ${version.id}; the previous published version was superseded atomically.`);
