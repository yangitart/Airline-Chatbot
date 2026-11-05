import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export function TravelSectionLayout({ eyebrow, title, description, children }: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <main className="min-h-[calc(100dvh-62px)] pt-5 text-airline-ink sm:min-h-[calc(100dvh-72px)] sm:pt-8">
      <section className="mx-auto w-[min(calc(100%_-_32px),1120px)] rounded-[28px] border border-airline-line bg-airline-paper px-6 py-8 sm:px-10 sm:py-12">
        <div className="border-l-2 border-airline-gold pl-5 sm:pl-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-airline-garnet">{eyebrow}</p>
          <h1 className="max-w-3xl font-serif text-[clamp(2rem,5vw,3.75rem)] leading-tight tracking-tight text-airline-night">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-airline-muted sm:text-base">{description}</p>
        </div>
      </section>
      <div className="mx-auto w-[min(calc(100%_-_32px),1120px)] py-8 sm:py-12">{children}</div>
      <footer className="border-t border-airline-line bg-airline-paper px-4 py-6 text-center text-xs text-airline-muted">
        <span>Veyra</span><span aria-hidden="true" className="mx-2 text-airline-gold">·</span>{t("travelPages.footer")}
      </footer>
    </main>
  );
}
