import { createHash } from "node:crypto";

export const faqEmbeddingModel = "local:faq-feature-hashing-v1";
export const faqEmbeddingDimensions = 1536;

const stopWords = new Set(
  ("a al an and are as at be by can como con cual cuando de del do does el en es for from how i in is it la las lo los me mi my of on or para puedo que se the to un una what when where which with y you your question answer").split(" "),
);

/**
 * Signed feature hashing over normalized word frequencies. The publisher and
 * retriever share this implementation so vectors occupy the same space.
 * @param {string} text
 * @returns {number[]}
 */
export function embedFaqText(text) {
  const words = text.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const counts = new Map();
  for (const word of words) {
    if (word.length > 1 && !stopWords.has(word)) counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  const vector = new Array(faqEmbeddingDimensions).fill(0);
  for (const [word, count] of counts) {
    const hash = createHash("sha256").update(word).digest();
    const bucket = hash.readUInt32LE(0) % faqEmbeddingDimensions;
    vector[bucket] += (hash[4] & 1 ? -1 : 1) * (1 + Math.log(count));
  }
  const norm = Math.hypot(...vector);
  return norm ? vector.map((value) => value / norm) : vector;
}
