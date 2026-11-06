const bookingIdPattern = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export function parseBookingLookup(value: string) {
  const input = value.trim();
  if (bookingIdPattern.test(input)) return { column: "id" as const, value: input.toLowerCase() };

  const reference = /^(?:(?:AI|DEMO)-)?([0-9A-F]{10})$/i.exec(input);
  if (!reference) return null;
  return { column: "booking_reference" as const, value: `DEMO-${reference[1].toUpperCase()}` };
}

export function displayBookingReference(reference: string) {
  return reference.replace(/^DEMO-/i, "AI-");
}
