"use client";

import type { ReactNode } from "react";

export function SuggestionChip({
  prompt,
  icon,
  onClick,
}: {
  prompt: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-airline-line bg-white px-3 py-2 text-xs text-airline-ink transition hover:border-airline-gold hover:bg-airline-forest-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-gold"
    >
      {icon}
      {prompt}
    </button>
  );
}
