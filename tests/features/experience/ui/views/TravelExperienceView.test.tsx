import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import TravelExperienceView from "@/src/features/experience/ui/views/TravelExperienceView";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: "en" },
  }),
}));
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));
afterEach(cleanup);

it("opens the selected experience and links to its local resource", () => {
  render(<TravelExperienceView />);
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
  expect(screen.queryByText(/^0[1-4]$/)).toBeNull();
  const destinations = {
    inAir: "/faqs/wifi",
    fleet: "/#where-we-fly",
    transformation: "/faqs/app",
  };
  for (const [key, href] of Object.entries(destinations)) {
    const summary = screen
      .getByText(`travelPages.experienceAreas.${key}.title`)
      .closest("summary")!;
    fireEvent.click(summary);
    const details = summary.closest("details")!;
    expect(details.open).toBe(true);
    expect(within(details).getByRole("link").getAttribute("href")).toBe(href);
  }
});
