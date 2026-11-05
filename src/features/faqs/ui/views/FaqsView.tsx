"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, BriefcaseBusiness, CheckCircle2, ClipboardCheck, CreditCard, Headset, HeartPulse, Plane, Radio, Search, ShieldCheck, Smartphone, Users, Wifi } from "lucide-react";
import { TravelSectionLayout } from "@/src/components/layout/TravelSectionLayout";
import { supportedLanguages } from "@/src/core/locales/supportedLanguages";
import faqDetails from "@/src/features/faqs/data/faqDetails.json";
import faqEntries from "@/src/features/faqs/data/faqEntries.json";
import faqSummaries from "@/src/features/faqs/data/faqSummaries.json";

const categories = ["booking", "checkin", "baggage", "reaccommodation", "loyalty", "notifications", "insurance", "cargo", "health", "children", "pets", "payments", "integration", "rail", "app", "account", "wifi", "baggage-guidelines", "customer-support", "flight-status-info", "online-checkin-info"] as const;
const icons = [Plane, CheckCircle2, BriefcaseBusiness, Radio, ShieldCheck, Smartphone, HeartPulse, BookOpen, HeartPulse, Users, HeartPulse, CreditCard, Plane, Radio, Smartphone, ShieldCheck, Wifi, BriefcaseBusiness, Headset, Plane, ClipboardCheck];

export default function FaqsView({ category }: { category?: string }) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const activeLanguage = supportedLanguages.find((language) => language.code === i18n.resolvedLanguage) ?? supportedLanguages[0];
  const validCategory = categories.find((item) => item === category);
  const text = (key: string) => t(`faqs.${key}`);
  const title = validCategory ? text(`categories.${validCategory}.title`) : text("title");
  const description = validCategory ? text(`categories.${validCategory}.description`) : text("description");
  const visibleCategories = categories.filter((item) => {
    const searchText = `${text(`categories.${item}.title`)} ${text(`categories.${item}.description`)} ${faqEntries[item].flat().join(" ")}`;
    return searchText.toLocaleLowerCase(activeLanguage.code).includes(query.trim().toLocaleLowerCase(activeLanguage.code));
  });
  const activeDocument = faqSummaries.documents.find((document) => document.id === validCategory);
  const details: Record<string, Record<string, string>> = faqDetails;
  const sectionAnswers = details[validCategory ?? ""];
  const categoryEntries = faqEntries[validCategory as keyof typeof faqEntries] ?? [];
  const visibleEntries = categoryEntries.filter((entry) => !query.trim() || `${entry[0]} ${entry[1]}`.toLocaleLowerCase(activeLanguage.code).includes(query.trim().toLocaleLowerCase(activeLanguage.code)));
  const visibleSections = activeDocument?.sections.filter((section) => {
    const matchesSection = !activeSection || section === activeSection;
    const matchesQuery = !query.trim() || `${section} ${sectionAnswers?.[section] ?? ""}`.toLocaleLowerCase(activeLanguage.code).includes(query.trim().toLocaleLowerCase(activeLanguage.code));
    return matchesSection && matchesQuery;
  }) ?? [];

  return <TravelSectionLayout eyebrow={text("eyebrow")} title={title} description={description}>
    {validCategory ? <>
      <Link href="/faqs" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-airline-forest no-underline hover:text-airline-garnet"><ArrowLeft size={16} />{text("allTopics")}</Link>
      <div className="grid gap-8">
        <section aria-label={title} className="min-w-0">
          <div className="mb-5 flex flex-col gap-4 rounded-[24px] border border-airline-line bg-airline-paper p-4 sm:flex-row sm:items-center sm:p-5">
            <label className="sr-only" htmlFor="faq-question-search">{text("searchQuestions")}</label>
            <input id="faq-question-search" type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder={text("searchQuestionsPlaceholder")} className="min-h-12 min-w-0 flex-1 rounded-xl border border-airline-line bg-white px-4 text-sm outline-none transition focus:border-airline-garnet focus:ring-2 focus:ring-airline-garnet/15" />
            <label className="sr-only" htmlFor="faq-section-select">{text("selectSection")}</label>
            <select id="faq-section-select" value={activeSection} onChange={(event) => setActiveSection(event.currentTarget.value)} className="min-h-12 rounded-xl border border-airline-line bg-white px-4 text-sm text-airline-ink outline-none focus:border-airline-garnet focus:ring-2 focus:ring-airline-garnet/15">
              <option value="">{text("allSections")}</option>
              {activeDocument?.sections.map((section) => <option key={section} value={section}>{section}</option>)}
            </select>
          </div>
          <article className="rounded-[24px] border border-airline-line bg-airline-paper p-6 sm:p-8">
            <h2 className="text-xs font-bold uppercase tracking-[.14em] text-airline-garnet">{text("articleOverview")}</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-airline-muted">{activeDocument?.summary}</p>
            {validCategory === "flight-status-info" && <Link href="/flight-status" className="mt-5 inline-flex items-center gap-2 rounded-full bg-airline-forest px-5 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#24564d]">{text("openLocalStatus")}<ArrowUpRight size={16} aria-hidden="true" /></Link>}
            <h3 className="mt-8 text-base font-semibold text-airline-night">{text("articleSections")}</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2" lang="en">
              {visibleSections.map((section) => {
                const answer = sectionAnswers?.[section];
                return answer ? (
                  <details key={section} className="rounded-xl border border-airline-line bg-white px-4 py-3 open:border-airline-forest">
                    <summary className="cursor-pointer font-semibold text-airline-forest">{section}</summary>
                    <p className="mt-3 text-sm leading-6 text-airline-ink">{answer}</p>
                  </details>
                ) : (
                  <p key={section} className="rounded-xl border border-airline-line/80 px-4 py-3 text-sm text-airline-muted">{section}</p>
                );
              })}
              {!visibleSections.length && <p className="col-span-full py-6 text-center text-sm text-airline-muted">{text("noQuestions")}</p>}
            </div>
            <h3 className="mt-8 text-base font-semibold text-airline-night">{text("articleQuestions")}</h3>
            <div className="mt-3 divide-y divide-airline-line rounded-2xl border border-airline-line bg-white px-4 sm:px-5" lang="en">
              {visibleEntries.map(([question, answer]) => <details key={question} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-airline-night marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-forest">{question}<span className="text-lg text-airline-forest transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary>
                <p className="max-w-3xl pt-3 text-sm leading-6 text-airline-muted">{answer}</p>
              </details>)}
              {!visibleEntries.length && <p className="py-6 text-center text-sm text-airline-muted">{text("noQuestions")}</p>}
            </div>
          </article>
        </section>
      </div>
    </> : (
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-8">
        <div className="rounded-[28px] bg-airline-night p-6 text-white sm:p-8 lg:sticky lg:top-24">
          <label className="font-serif text-2xl" htmlFor="faq-search">{text("search")}</label>
          <div className="relative mt-4">
            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-airline-forest" aria-hidden="true" />
            <input id="faq-search" type="search" value={query} placeholder={text("searchPlaceholder")} onChange={(event) => setQuery(event.currentTarget.value)}
              className="min-h-12 w-full rounded-xl border border-transparent bg-airline-paper py-3 pl-11 pr-4 text-sm text-airline-night focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-gold" />
          </div>
          <p className="mt-4 text-sm text-airline-gold" role="status">{t("faqs.topicCount", { count: visibleCategories.length })}</p>
          <p className="mt-4 border-t border-white/15 pt-4 text-xs leading-5 text-white/80">{text("disclaimer")}</p>
        </div>
        <div className="overflow-hidden rounded-[28px] border border-airline-line bg-airline-paper shadow-[0_12px_32px_rgb(23_40_59_/_6%)]">
          {visibleCategories.length ? (
            <ul className="divide-y divide-airline-line">
              {visibleCategories.map((item) => {
                const Icon = icons[categories.indexOf(item)];
                return (
                  <li key={item}>
                    <Link href={`/faqs/${item}`} className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 text-airline-ink no-underline transition-colors hover:bg-airline-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-airline-forest sm:gap-4 sm:px-6">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-airline-forest-soft text-airline-forest"><Icon size={18} aria-hidden="true" /></span>
                      <span className="min-w-0">
                        <span className="block text-base font-semibold text-airline-night">{text(`categories.${item}.title`)}</span>
                        <span className="mt-1 block text-sm leading-5 text-airline-muted">{text(`categories.${item}.description`)}</span>
                      </span>
                      <ArrowRight size={17} className="text-airline-forest group-hover:text-airline-garnet" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : <p className="p-6 text-sm text-airline-muted">{text("noQuestions")}</p>}
        </div>
      </div>
    )}
  </TravelSectionLayout>;
}


