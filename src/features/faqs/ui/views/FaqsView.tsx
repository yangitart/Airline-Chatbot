"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
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
  X,
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

const commonTopics = [
  "booking",
  "baggage",
  "checkin",
  "flight-status-info",
  "payments",
  "customer-support",
] as const;

function normalizeFaqSearch(value: string, locale: string) {
  return value
    .toLocaleLowerCase(locale)
    .normalize("NFD")
    .replace(/(\p{Script=Latin})\p{M}+/gu, "$1")
    .replace(/[^\p{L}\p{M}\p{N}]/gu, "");
}

function FaqSearchField({
  id,
  value,
  placeholder,
  controls,
  onChange,
}: {
  id: string;
  value: string;
  placeholder: string;
  controls: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative min-w-0 flex-1">
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-airline-forest"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        aria-controls={controls}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="min-h-12 w-full rounded-xl border border-airline-line bg-airline-paper py-3 pl-11 pr-12 text-sm text-airline-night focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-gold [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          aria-label={t("faqs.clearSearch")}
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-airline-forest hover:bg-airline-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-forest"
        >
          <X size={17} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default function FaqsView({
  category,
  embedded = false,
}: {
  category?: string;
  embedded?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const [showAllTopics, setShowAllTopics] = useState(false);
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
  const activeDocument = validCategory ? articles[validCategory] : undefined;
  const normalizedQuery = normalizeFaqSearch(query, activeLanguage.code);
  const matches = (value: string) =>
    !normalizedQuery ||
    normalizeFaqSearch(value, activeLanguage.code).includes(normalizedQuery);
  const visibleCategories =
    !activeDocument && normalizedQuery
      ? faqCategories.filter((item) => {
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
        })
      : faqCategories;
  const displayedCategories =
    normalizedQuery || showAllTopics ? visibleCategories : commonTopics;
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
                <FaqSearchField
                  id="faq-question-search"
                  value={query}
                  onChange={setQuery}
                  placeholder={text("searchQuestionsPlaceholder")}
                  controls="faq-question-results"
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
                <div
                  id="faq-question-results"
                  className="mt-4 grid gap-5"
                  lang={language}
                >
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
        <div className="rounded-[2rem] border border-airline-line bg-airline-paper p-3 sm:p-5">
          <div className="grid gap-4 rounded-[1.5rem] bg-airline-night px-5 py-5 text-white sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-end">
            <div>
              <label
                className="font-serif text-2xl sm:text-3xl"
                htmlFor="faq-search"
              >
                {text("search")}
              </label>
              <p className="mt-2 max-w-sm text-xs leading-5 text-white/85 sm:text-sm">
                {text("disclaimer")}
              </p>
            </div>
            <FaqSearchField
              id="faq-search"
              value={query}
              placeholder={text("searchPlaceholder")}
              onChange={setQuery}
              controls="faq-topic-index"
            />
          </div>

          <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 px-2 py-2">
            <p
              className="rounded-full bg-airline-forest-soft px-3 py-1.5 text-xs font-semibold text-airline-forest"
              role="status"
            >
              {normalizedQuery || showAllTopics
                ? t("faqs.topicCount", { count: visibleCategories.length })
                : t("faqs.topicPreviewCount", {
                    shown: commonTopics.length,
                    total: faqCategories.length,
                  })}
            </p>
            {!normalizedQuery && (
              <button
                type="button"
                aria-expanded={showAllTopics}
                aria-controls="faq-topic-index"
                onClick={() => setShowAllTopics((current) => !current)}
                className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-airline-forest hover:bg-airline-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-forest"
              >
                {text(showAllTopics ? "showCommonTopics" : "showAllTopics")}
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className={showAllTopics ? "rotate-180" : undefined}
                />
              </button>
            )}
          </div>
          <div id="faq-topic-index">
            {displayedCategories.length ? (
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {displayedCategories.map((item) => {
                  const Icon = icons[item];
                  return (
                    <li key={item}>
                      <Link
                        href={`/faqs/${item}`}
                        className="group flex h-full flex-col rounded-2xl border border-airline-line bg-airline-canvas/55 px-4 py-3 text-airline-ink no-underline transition-colors hover:border-airline-forest/40 hover:bg-airline-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-forest"
                      >
                        <span className="mb-2 flex items-center justify-between gap-3 text-airline-forest">
                          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-airline-forest-soft">
                            <Icon size={18} aria-hidden="true" />
                          </span>
                          <ArrowUpRight
                            size={17}
                            className="motion-safe:transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5 motion-safe:group-focus-visible:-translate-y-0.5 motion-safe:group-focus-visible:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </span>
                        <span className="font-serif text-xl leading-tight text-airline-night">
                          {categoryTitle(item)}
                        </span>
                        <span className="mt-1 text-sm leading-5 text-airline-muted">
                          {categoryDescription(item)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="p-6 text-sm text-airline-muted">
                {text("noTopics")}
              </p>
            )}
          </div>
        </div>
      )}
    </TravelSectionLayout>
  );
}
