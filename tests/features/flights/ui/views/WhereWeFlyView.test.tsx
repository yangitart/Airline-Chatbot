import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import WhereWeFlyView from "@/src/features/flights/ui/views/WhereWeFlyView";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: "en" },
  }),
}));
afterEach(cleanup);

it("updates the photo and the search link to match the selected route", () => {
  const { container } = render(<WhereWeFlyView onSelectRoute={vi.fn()} />);
  const destinations = screen.getByRole("group", {
    name: "travelPages.chooseDestination",
  });
  fireEvent.click(within(destinations).getByRole("button", { name: /LHR/ }));

  const searchLink = screen.getByRole("link", {
    name: "travelPages.searchFlights",
  });
  expect(searchLink.getAttribute("href")).toBe(
    "/?origin=DEL&destination=LHR#search",
  );
  const photo = container.querySelector(
    'img[src="/images/london-tower-bridge.webp"]',
  );
  expect(photo).toBeTruthy();
  expect(
    searchLink.compareDocumentPosition(photo!) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();

  const departures = screen.getByRole("group", {
    name: "travelPages.chooseOrigin",
  });
  fireEvent.click(within(departures).getByRole("button", { name: /MAA/ }));
  expect(within(destinations).getAllByRole("button")).toHaveLength(1);
  expect(searchLink.getAttribute("href")).toBe(
    "/?origin=MAA&destination=DEL#search",
  );
});
