import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { FlightHero } from "./FlightHero";
import { FlightResults } from "./FlightResults";

const carousel = vi.hoisted(() => {
  let position = 0;
  let onSelect: (() => void) | undefined;
  const api = {
    selectedScrollSnap: () => position,
    scrollTo: (index: number) => { position = index; onSelect?.(); },
    scrollNext: () => { api.scrollTo(position + 1); },
    on: (event: string, callback: () => void) => { if (event === "select") onSelect = callback; return api; },
    off: (event: string) => { if (event === "select") onSelect = undefined; return api; },
  };
  return api;
});

vi.mock("embla-carousel-react", () => ({ default: () => [undefined, carousel] }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { resolvedLanguage: "en" } }) }));
vi.mock("next/image", () => ({ default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} /> }));

afterEach(() => {
  cleanup();
  carousel.scrollTo(0);
  vi.unstubAllGlobals();
});

it("changes the photo and flag when the carousel moves to a different destination", () => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
  const { container } = render(<FlightHero onSelectRoute={vi.fn()} flights={[
    { origin: "DEL", destination: "LHR", date: "2026-11-10", number: "AI 901" },
    { origin: "DEL", destination: "SIN", date: "2026-11-10", number: "AI 951" },
  ]} />);
  expect(container.querySelector('img[src="/images/london-tower-bridge.webp"]')).toBeTruthy();
  expect(container.querySelector('img[src="/flags/gb.svg"]')).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "travelPages.carouselNext" }));
  expect(container.querySelector('img[src="/images/singapore-marina-bay.webp"]')).toBeTruthy();
  expect(container.querySelector('img[src="/flags/sg.svg"]')).toBeTruthy();
});

it("shows the photo of the arrival city for both legs in flight results", () => {
  const { container } = render(<FlightResults
    result={{
      origin: "DEL", destination: "LHR", departure_date: "2026-11-10", return_date: "2026-11-13",
      passengers: 1, cabin_class: "economy", is_mock: true, notice: "", flights: [], return_flights: [],
    }}
    isAuthenticated bookingBusy={false} booking={null} bookingError="" onBook={vi.fn()} onBack={vi.fn()}
  />);
  expect(container.querySelector('img[src="/images/london-tower-bridge.webp"]')).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /^tripOperations.return/ }));
  expect(container.querySelector('img[src="/images/delhi-india-gate.webp"]')).toBeTruthy();
  expect(container.querySelector('img[src="/flags/in.svg"]')).toBeTruthy();
});
