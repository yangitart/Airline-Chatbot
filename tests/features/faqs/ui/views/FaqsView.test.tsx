import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import FaqsView from "@/src/features/faqs/ui/views/FaqsView";
import { faqCategories } from "@/src/features/faqs/data/faqCatalog";

const language = vi.hoisted(() => ({ code: "en" }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: language.code },
  }),
}));
afterEach(() => {
  cleanup();
  language.code = "en";
});

it("keeps the complete catalog searchable when common topics are shown", () => {
  const { container } = render(<FaqsView embedded />);
  const index = within(
    container.querySelector<HTMLElement>("#faq-topic-index")!,
  );
  expect(index.getAllByRole("link")).toHaveLength(6);

  fireEvent.click(screen.getByRole("button", { name: "faqs.showAllTopics" }));
  expect(index.getAllByRole("link")).toHaveLength(faqCategories.length);
  fireEvent.click(
    screen.getByRole("button", { name: "faqs.showCommonTopics" }),
  );

  const search = screen.getByRole("searchbox");
  fireEvent.change(search, {
    target: { value: "Can I assume my flight has WIFI" },
  });
  expect(
    index.getAllByRole("link").map((link) => link.getAttribute("href")),
  ).toEqual(["/faqs/wifi"]);

  fireEvent.click(screen.getByRole("button", { name: "faqs.clearSearch" }));
  expect(search).toHaveProperty("value", "");
  expect(document.activeElement).toBe(search);
  expect(index.getAllByRole("link")).toHaveLength(6);
});

it("finds questions in a Spanish section when the query omits accents", () => {
  language.code = "es";
  render(<FaqsView category="wifi" />);

  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "preparar la conexion" },
  });

  expect(
    screen.getByText("¿Puedo dar por hecho que mi vuelo tiene wifi?"),
  ).toBeTruthy();
});
