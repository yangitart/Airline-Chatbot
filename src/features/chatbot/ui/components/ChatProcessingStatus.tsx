"use client";

export function ChatProcessingStatus({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm font-medium leading-snug text-airline-forest">
      <span
        className="flex h-6 shrink-0 items-center gap-1 rounded-full bg-white/80 px-2 motion-safe:[&>span]:animate-assistant-processing-dot motion-safe:[&>span:nth-child(2)]:[animation-delay:150ms] motion-safe:[&>span:nth-child(3)]:[animation-delay:300ms]"
        aria-hidden="true"
      >
        <span className="size-1.5 rounded-full bg-current" />
        <span className="size-1.5 rounded-full bg-current" />
        <span className="size-1.5 rounded-full bg-current" />
      </span>
      <span>{label}</span>
    </div>
  );
}
