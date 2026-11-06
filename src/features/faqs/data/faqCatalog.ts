import english from "./veyra-faq.en.json";
import spanish from "./veyra-faq.es.json";

type FaqCategory = keyof typeof english;

type FaqArticle = {
  title: string;
  overview: string;
  sections: Array<{
    id: string;
    title: string;
    entries: Array<{ question: string; answer: string }>;
  }>;
};

const catalogs: Record<"en" | "es", Record<FaqCategory, FaqArticle>> = {
  en: english,
  es: spanish,
};

export const faqCategories = Object.keys(english) as FaqCategory[];

export function isFaqCategory(category: string): category is FaqCategory {
  return Object.hasOwn(english, category);
}

export function getFaqCatalog(locale: string) {
  const language = locale === "es" ? "es" : "en";
  return { language, articles: catalogs[language] };
}
