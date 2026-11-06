import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { embedFaqText, faqEmbeddingDimensions, faqEmbeddingModel } from "../src/features/chatbot/data/providers/localFaqEmbeddings.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogDir = path.join(root, "src", "features", "faqs", "data");
const isPublish = process.argv.includes("--publish");
const isDryRun = process.argv.includes("--dry-run");

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
console.log(`FAQ vectors: ${faqEmbeddingModel} (${faqEmbeddingDimensions} dimensions).`);

const embeddedChunks = chunks.map((chunk) => {
  const embedding = embedFaqText(chunk.content);
  if (!embedding.some((value) => value !== 0)) throw new Error(`FAQ entry has no searchable words: ${chunk.document_id}`);
  return { ...chunk, embedding };
});
console.log(`Generated ${embeddedChunks.length} FAQ vectors locally.`);

if (isDryRun) {
  console.log("Dry run only. No API calls or Supabase writes were made.");
} else {
  try {
    await publishCatalog(documents, embeddedChunks);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "FAQ publication failed.");
    process.exitCode = 1;
  }
}

async function publishCatalog(documents, embeddedChunks) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("Publishing needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or the legacy SUPABASE_SERVICE_ROLE_KEY) in the local environment.");
  }

  const admin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: version, error: versionError } = await admin.from("faq_corpus_versions")
    .insert({
      status: "staging",
      expected_documents: documents.length,
      expected_chunks: embeddedChunks.length,
      embedding_model: faqEmbeddingModel,
    })
    .select("id")
    .single();
  if (versionError?.code === "PGRST205" || versionError?.code === "PGRST204") {
    const host = new URL(supabaseUrl).hostname;
    const command = ["localhost", "127.0.0.1", "[::1]"].includes(host)
      ? "npx supabase db push"
      : "npx supabase db push --remote";
    throw new Error(`FAQ schema is unavailable on ${host} (${versionError.code}). Apply the FAQ migrations to this project with ${command}, then run npm run faq:index:publish again.`);
  }
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
}
