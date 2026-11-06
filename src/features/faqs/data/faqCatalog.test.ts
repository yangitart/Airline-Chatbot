import { describe, expect, it } from "vitest";
import { faqCategories, getFaqCatalog, isFaqCategory } from "./faqCatalog";

describe("Veyra FAQ catalog", () => {
  it("keeps matching sections and answers across both authored languages", () => {
    const english = getFaqCatalog("en").articles;
    const spanish = getFaqCatalog("es").articles;
    expect(faqCategories).toHaveLength(21);

    for (const category of faqCategories) {
      const en = english[category];
      const es = spanish[category];
      expect(es.sections.map((section) => section.id)).toEqual(en.sections.map((section) => section.id));
      for (const article of [en, es]) {
        expect(article.sections.flatMap((section) => section.entries)).toHaveLength(3);
        for (const { question, answer } of article.sections.flatMap((section) => section.entries)) {
          expect(question.trim()).toBeTruthy();
          expect(answer.trim()).toBeTruthy();
          expect(answer).not.toMatch(/airindia\.com|Vistara/i);
        }
      }
    }
  });

  it("preserves the local guides used by Prepare to travel", () => {
    for (const slug of ["baggage-guidelines", "online-checkin-info", "customer-support"]) {
      expect(isFaqCategory(slug)).toBe(true);
    }
    expect(isFaqCategory("toString")).toBe(false);
  });
});
