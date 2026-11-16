// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { FaqRetrieverImpl } from "@/src/features/chatbot/data/repositories/FaqRetrieverImpl";

const row = {
  document_id: "faq",
  title: "Baggage",
  source_category: "baggage",
  section_title: "Allowance",
  content: "Demo policy",
  page_number: null,
  similarity: 0.7,
};

describe("FAQ retrieval repository", () => {
  it.each([
    ["es", "es"],
    ["fr", "en"],
  ])(
    "retrieves %s evidence, filters weak matches and maps rows",
    async (locale, expectedLanguage) => {
      const embedQuery = vi.fn().mockResolvedValue([1, 0]);
      const search = vi
        .fn()
        .mockResolvedValue([row, { ...row, similarity: 0.51 }]);
      const repository = FaqRetrieverImpl({ search }, { embedQuery });
      await expect(repository.search("bags", locale)).resolves.toEqual([
        {
          documentId: "faq",
          title: "Baggage",
          sourceCategory: "baggage",
          sectionTitle: "Allowance",
          content: "Demo policy",
          pageNumber: undefined,
          similarity: 0.7,
        },
      ]);
      expect(search).toHaveBeenCalledWith(
        "bags",
        [1, 0],
        expectedLanguage,
        expect.any(AbortSignal),
      );
      expect(search.mock.calls[0][3]).toBe(embedQuery.mock.calls[0][1]);
    },
  );

  it("maps dependency failures without exposing their message", async () => {
    const search = vi.fn();
    const repository = FaqRetrieverImpl(
      { search },
      { embedQuery: vi.fn().mockRejectedValue(new Error("provider detail")) },
    );
    await expect(repository.search("bags", "en")).rejects.toMatchObject({
      code: "faq_unavailable",
      message: "faq_unavailable",
    });
    expect(search).not.toHaveBeenCalled();
  });

  it("does not call either dependency when the request is cancelled", async () => {
    const controller = new AbortController();
    controller.abort();
    const search = vi.fn();
    const embedQuery = vi.fn();
    await expect(
      FaqRetrieverImpl({ search }, { embedQuery }).search(
        "bags",
        "en",
        controller.signal,
      ),
    ).rejects.toBe(controller.signal.reason);
    expect(search).not.toHaveBeenCalled();
    expect(embedQuery).not.toHaveBeenCalled();
  });
});
