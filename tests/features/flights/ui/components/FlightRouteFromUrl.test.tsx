import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { FlightRouteFromUrl } from "@/src/features/flights/ui/components/FlightRouteFromUrl";

const navigation = vi.hoisted(() => ({ query: "" }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigation.query),
}));
afterEach(cleanup);

it("prefills another route when the URL changes and ignores invalid airport pairs", () => {
  const onSelect = vi.fn();
  navigation.query = "origin=DEL&destination=LHR";
  const { rerender } = render(<FlightRouteFromUrl onSelect={onSelect} />);
  expect(onSelect).toHaveBeenLastCalledWith({
    origin: "DEL",
    destination: "LHR",
  });

  navigation.query = "origin=DEL&destination=SIN";
  rerender(<FlightRouteFromUrl onSelect={onSelect} />);
  expect(onSelect).toHaveBeenLastCalledWith({
    origin: "DEL",
    destination: "SIN",
  });

  navigation.query = "origin=DEL&destination=DEL";
  rerender(<FlightRouteFromUrl onSelect={onSelect} />);
  expect(onSelect).toHaveBeenCalledTimes(2);
});
