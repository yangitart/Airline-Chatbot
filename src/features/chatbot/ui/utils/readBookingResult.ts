import { isLeft, type Either } from "fp-ts/Either";
import { TripOperationError } from "@/src/features/bookings/domain/models/TripOperationError";

export function readBookingResult<T>(result: Either<string, T>): T {
  if (isLeft(result)) throw new TripOperationError(result.left);
  return result.right;
}
