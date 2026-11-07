export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-skeleton-shimmer rounded-xl bg-gradient-to-r from-[#e8e6de] via-[#f4f2eb] to-[#e8e6de] bg-[length:200%_100%] motion-reduce:animate-none ${className}`}
    />
  );
}
