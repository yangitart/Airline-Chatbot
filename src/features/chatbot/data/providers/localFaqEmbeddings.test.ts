import { expect, it } from "vitest";
import { embedFaqText, faqEmbeddingDimensions } from "./localFaqEmbeddings.mjs";

it("generates stable pgvector-compatible vectors across case and accents", () => {
  const vector = embedFaqText("Cancelación de vuelo");
  expect(vector).toHaveLength(faqEmbeddingDimensions);
  expect(vector.every(Number.isFinite)).toBe(true);
  expect(Math.hypot(...vector)).toBeCloseTo(1);
  expect(embedFaqText("CANCELACION DE VUELO")).toEqual(vector);
});

it("ranks a related FAQ above an unrelated FAQ and skips empty queries", () => {
  const query = embedFaqText("¿Cuánto equipaje facturado puedo llevar?");
  const similarity = (text: string) => embedFaqText(text)
    .reduce((score, value, index) => score + value * query[index], 0);

  expect(similarity("El equipaje facturado permitido depende de tu tarifa.")).toBeGreaterThan(0.25);
  expect(similarity("El equipaje facturado permitido depende de tu tarifa."))
    .toBeGreaterThan(similarity("Solicita la devolución del pago en la sección de reservas."));
  expect(embedFaqText("¿Y de la?").some(Boolean)).toBe(false);
});
