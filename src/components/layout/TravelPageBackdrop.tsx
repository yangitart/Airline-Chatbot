import type { TravelTab } from "@/src/features/flights/ui/components/FlightsHeader";

const palettes = {
  bookManage: ["#9bcac4", "#efd3a2"],
  whereFly: ["#98c6d7", "#d2dfb0"],
  prepareTravel: ["#a9c7b7", "#e9cca4"],
  faqs: ["#afc5df", "#dec9dd"],
  experience: ["#c8bedc", "#f2c9a7"],
} satisfies Record<TravelTab, [string, string]>;

export function TravelPageBackdrop({
  tab,
  muted,
}: {
  tab?: TravelTab;
  muted: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      data-muted={muted}
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-airline-canvas data-[muted=true]:opacity-[.28] motion-safe:transition-opacity motion-safe:duration-700 motion-safe:ease-in-out"
    >
      <div className="absolute -inset-[16%] motion-safe:animate-travel-wash">
        {Object.entries(palettes).map(([key, [cool, warm]]) => (
          <div
            key={key}
            className="absolute inset-0 opacity-0 data-[active=true]:opacity-100 motion-safe:transition-opacity motion-safe:duration-700 motion-safe:ease-in-out"
            data-active={tab === key}
            style={{
              backgroundImage: `radial-gradient(ellipse at 12% 26%, ${cool}, transparent 62%), radial-gradient(ellipse at 88% 30%, ${warm}, transparent 58%)`,
            }}
          />
        ))}
      </div>
      <svg
        viewBox="0 0 1440 840"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        <g
          className="origin-center [transform-box:fill-box] motion-safe:animate-travel-wave-far"
          stroke="#568e87"
        >
          <path
            d="M-180 515C120 415 266 634 596 568S1110 368 1620 509"
            strokeOpacity=".43"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M-180 536C120 436 266 655 596 589S1110 389 1620 530"
            strokeOpacity=".24"
            vectorEffect="non-scaling-stroke"
          />
        </g>
        <g
          className="origin-center [transform-box:fill-box] motion-safe:animate-travel-wave-near"
          stroke="#a48254"
        >
          <path
            d="M-180 606C150 743 340 472 712 563s555 142 908-10"
            strokeOpacity=".36"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M-180 628C150 765 340 494 712 585s555 142 908-10"
            strokeOpacity=".2"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-airline-canvas to-transparent" />
    </div>
  );
}
