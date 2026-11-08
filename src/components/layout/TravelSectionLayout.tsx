"use client";

import type { ReactNode } from "react";
import { TravelFooter } from "./TravelFooter";

function SectionHeading({
  title,
  description,
  eyebrow,
  headingId,
  embedded,
}: {
  eyebrow: string;
  title: string;
  description: string;
  headingId?: string;
  embedded: boolean;
}) {
  const Heading = embedded ? "h2" : "h1";
  if (embedded) {
    return (
      <header className="grid gap-3 border-t border-airline-forest/20 pt-4 sm:gap-5 sm:pt-6 md:grid-cols-[minmax(0,1fr)_minmax(0,.65fr)] md:items-end">
        <div>
          <p className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-[.16em] text-airline-garnet">
            <span aria-hidden="true" className="h-px w-7 bg-airline-gold" />
            {eyebrow}
          </p>
          <Heading
            id={headingId}
            className="font-serif text-[clamp(2rem,5vw,3.75rem)] leading-tight tracking-tight text-airline-night"
          >
            {title}
          </Heading>
        </div>
        <p className="max-w-md text-sm leading-7 text-airline-ink sm:text-base">
          {description}
        </p>
      </header>
    );
  }

  return (
    <header className="mx-auto w-[min(calc(100%_-_32px),1120px)] rounded-[28px] border border-airline-line bg-airline-paper px-6 py-8 sm:px-10 sm:py-12">
      <div className="border-l-2 border-airline-gold pl-5 sm:pl-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-airline-garnet">
          {eyebrow}
        </p>
        <Heading
          id={headingId}
          className="max-w-3xl font-serif text-[clamp(2rem,5vw,3.75rem)] leading-tight tracking-tight text-airline-night"
        >
          {title}
        </Heading>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-airline-muted sm:text-base">
          {description}
        </p>
      </div>
    </header>
  );
}

export function TravelSectionLayout({
  eyebrow,
  title,
  description,
  children,
  embedded = false,
  sectionId,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  embedded?: boolean;
  sectionId?: string;
}) {
  const headingId = sectionId ? `${sectionId}-heading` : undefined;
  const heading = (
    <SectionHeading
      eyebrow={eyebrow}
      title={title}
      description={description}
      headingId={headingId}
      embedded={embedded}
    />
  );

  if (embedded) {
    return (
      <section
        id={sectionId}
        aria-labelledby={headingId}
        className="mx-auto w-[min(calc(100%_-_32px),1120px)] scroll-mt-[calc(62px_+_0.75rem)] py-5 sm:scroll-mt-[calc(72px_+_1rem)] sm:py-8"
      >
        {heading}
        <div className="mt-4 sm:mt-6">{children}</div>
      </section>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-62px)] pt-5 text-airline-ink sm:min-h-[calc(100dvh-72px)] sm:pt-8">
      {heading}
      <div className="mx-auto w-[min(calc(100%_-_32px),1120px)] py-8 sm:py-12">
        {children}
      </div>
      <TravelFooter />
    </main>
  );
}
