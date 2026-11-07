"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Headset,
  HeartPulse,
  Plane,
  Radio,
  Search,
  ShieldCheck,
  Smartphone,
  Users,
  Wifi,
} from "lucide-react";
import { TravelSectionLayout } from "@/src/components/layout/TravelSectionLayout";
import { supportedLanguages } from "@/src/core/locales/supportedLanguages";
import {
  faqCategories,
  getFaqCatalog,
  isFaqCategory,
} from "@/src/features/faqs/data/faqCatalog";

const icons = {
  booking: Plane,
  checkin: CheckCircle2,
  baggage: BriefcaseBusiness,
  reaccommodation: Radio,
  loyalty: ShieldCheck,
  notifications: Smartphone,
  insurance: HeartPulse,
  cargo: BookOpen,
  health: HeartPulse,
  children: Users,
  pets: HeartPulse,
  payments: CreditCard,
  integration: Plane,
  rail: Radio,
  app: Smartphone,
  account: ShieldCheck,
  wifi: Wifi,
  "baggage-guidelines": BriefcaseBusiness,
  "customer-support": Headset,
  "flight-status-info": Plane,
  "online-checkin-info": ClipboardCheck,
};

export default function FaqsView({
  category,
  embedded = false,
}: {
  category?: string;
  embedded?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const activeLanguage =
    supportedLanguages.find(
      (language) => language.code === i18n.resolvedLanguage,
    ) ?? supportedLanguages[0];
  const validCategory =
    category && isFaqCategory(category) ? category : undefined;
  const { language, articles } = getFaqCatalog(activeLanguage.code);
  const isLocalized = language === activeLanguage.code;
  const text = (key: string) => t(`faqs.${key}`);
  const categoryTitle = (item: keyof typeof articles) =>
    isLocalized ? articles[item].title : text(`categories.${item}.title`);
  const categoryDescription = (item: keyof typeof articles) =>
    isLocalized
      ? articles[item].overview
      : text(`categories.${item}.description`);
  const title = validCategory ? categoryTitle(validCategory) : text("title");
  const description = validCategory
    ? categoryDescription(validCategory)
    : text("description");
  const normalizedQuery = query.trim().toLocaleLowerCase(activeLanguage.code);
  const matches = (value: string) =>
    value.toLocaleLowerCase(activeLanguage.code).includes(normalizedQuery);
  const visibleCategories = faqCategories.filter((item) => {
    const article = articles[item];
    return (
      matches(categoryTitle(item)) ||
      matches(categoryDescription(item)) ||
      matches(article.overview) ||
      article.sections.some(
        (section) =>
          matches(section.title) ||
          section.entries.some(({ question, answer }) =>
            matches(`${question} ${answer}`),
          ),
      )
    );
  });
  const activeDocument = validCategory ? articles[validCategory] : undefined;
  const visibleSections = (activeDocument?.sections ?? [])
    .filter((section) => !activeSection || section.id === activeSection)
    .map((section) => ({
      ...section,
      entries: matches(section.title)
        ? section.entries
        : section.entries.filter(({ question, answer }) =>
            matches(`${question} ${answer}`),
          ),
    }))
    .filter((section) => section.entries.length > 0);

  return (
    <TravelSectionLayout
      eyebrow={text("eyebrow")}
      title={title}
      description={description}
      embedded={embedded}
      sectionId={embedded ? "faqs" : undefined}
    >
      {validCategory ? (
        <>
          <Link
            href="/#faqs"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-airline-forest no-underline hover:text-airline-garnet"
          >
            <ArrowLeft size={16} />
            {text("allTopics")}
          </Link>
          <div className="grid gap-8">
            <section aria-label={title} className="min-w-0">
              <div className="mb-5 flex flex-col gap-4 rounded-[24px] border border-airline-line bg-airline-paper p-4 sm:flex-row sm:items-center sm:p-5">
                <label className="sr-only" htmlFor="faq-question-search">
                  {text("searchQuestions")}
                </label>
                <input
                  id="faq-question-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.currentTarget.value)}
                  placeholder={text("searchQuestionsPlaceholder")}
                  className="min-h-12 min-w-0 flex-1 rounded-xl border border-airline-line bg-white px-4 text-sm outline-none transition focus:border-airline-garnet focus:ring-2 focus:ring-airline-garnet/15"
                />
                <label className="sr-only" htmlFor="faq-section-select">
                  {text("selectSection")}
                </label>
                <select
                  id="faq-section-select"
                  value={activeSection}
                  onChange={(event) =>
                    setActiveSection(event.currentTarget.value)
                  }
                  className="min-h-12 rounded-xl border border-airline-line bg-white px-4 text-sm text-airline-ink outline-none focus:border-airline-garnet focus:ring-2 focus:ring-airline-garnet/15"
                >
                  <option value="">{text("allSections")}</option>
                  {activeDocument?.sections.map((section) => (
                    <option key={section.id} value={section.id} lang={language}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </div>
              <article className="rounded-[24px] border border-airline-line bg-airline-paper p-6 sm:p-8">
                <h2 className="text-xs font-bold uppercase tracking-[.14em] text-airline-garnet">
                  {text("articleOverview")}
                </h2>
                <p
                  className="mt-4 max-w-3xl text-sm leading-7 text-airline-muted"
                  lang={language}
                >
                  {activeDocument?.overview}
                </p>
                {validCategory === "flight-status-info" && (
                  <Link
                    href="/flight-status"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-airline-forest px-5 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#24564d]"
                  >
                    {text("openLocalStatus")}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                )}
                <h3 className="mt-8 text-base font-semibold text-airline-night">
                  {text("articleQuestions")}
                </h3>
                <div className="mt-4 grid gap-5" lang={language}>
                  {visibleSections.map((section) => (
                    <section key={section.id}>
                      <h4 className="mb-2 text-sm font-semibold text-airline-forest">
                        {section.title}
                      </h4>
                      <div className="divide-y divide-airline-line rounded-2xl border border-airline-line bg-white px-4 sm:px-5">
                        {section.entries.map(({ question, answer }) => (
                          <details key={question} className="group py-4">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-airline-night marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-forest">
                              {question}
                              <span
                                className="text-lg text-airline-forest transition-transform group-open:rotate-45"
                                aria-hidden="true"
                              >
                                +
                              </span>
                            </summary>
                            <p className="max-w-3xl pt-3 text-sm leading-6 text-airline-muted">
                              {answer}
                            </p>
                          </details>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
                {!visibleSections.length && (
                  <p className="py-6 text-center text-sm text-airline-muted">
                    {text("noQuestions")}
                  </p>
                )}
              </article>
            </section>
          </div>
        </>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-8">
          <div className="rounded-[28px] bg-airline-night p-6 text-white sm:p-8 lg:sticky lg:top-24">
            <label className="font-serif text-2xl" htmlFor="faq-search">
              {text("search")}
            </label>
            <div className="relative mt-4">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-airline-forest"
                aria-hidden="true"
              />
              <input
                id="faq-search"
                type="search"
                value={query}
                placeholder={text("searchPlaceholder")}
                onChange={(event) => setQuery(event.currentTarget.value)}
                className="min-h-12 w-full rounded-xl border border-transparent bg-airline-paper py-3 pl-11 pr-4 text-sm text-airline-night focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-gold"
              />
            </div>
            <p className="mt-4 text-sm text-airline-gold" role="status">
              {t("faqs.topicCount", { count: visibleCategories.length })}
            </p>
            <p className="mt-4 border-t border-white/15 pt-4 text-xs leading-5 text-white/80">
              {text("disclaimer")}
            </p>
          </div>
          <div className="overflow-hidden rounded-[28px] border border-airline-line bg-airline-paper shadow-[0_12px_32px_rgb(23_40_59_/_6%)]">
            {visibleCategories.length ? (
              <ul className="divide-y divide-airline-line">
                {visibleCategories.map((item) => {
                  const Icon = icons[item];
                  return (
                    <li key={item}>
                      <Link
                        href={`/faqs/${item}`}
                        className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 text-airline-ink no-underline transition-colors hover:bg-airline-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-airline-forest sm:gap-4 sm:px-6"
                      >
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-airline-forest-soft text-airline-forest">
                          <Icon size={18} aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-base font-semibold text-airline-night">
                            {categoryTitle(item)}
                          </span>
                          <span className="mt-1 block text-sm leading-5 text-airline-muted">
                            {categoryDescription(item)}
                          </span>
                        </span>
                        <ArrowRight
                          size={17}
                          className="text-airline-forest group-hover:text-airline-garnet"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="p-6 text-sm text-airline-muted">
                {text("noQuestions")}
              </p>
            )}
          </div>
        </div>
      )}
    </TravelSectionLayout>
  );
}
