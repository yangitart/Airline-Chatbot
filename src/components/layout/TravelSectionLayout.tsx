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
        className="scroll-mt-[calc(62px_+_0.75rem)] py-6 sm:scroll-mt-[calc(72px_+_1rem)] sm:py-8"
      >
        {heading}
        <div className="mx-auto w-[min(calc(100%_-_32px),1120px)] py-8 sm:py-12">
          {children}
        </div>
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
