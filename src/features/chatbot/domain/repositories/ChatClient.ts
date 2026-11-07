import type {
  ChatConversation,
  ChatConversationSummary,
} from "../models/ChatHistory";
import type { GroundedChatResponse } from "../models/FaqChunk";
import type {
  Booking,
  CreateDemoBookingCommand,
} from "@/src/features/bookings/domain/models/Booking";

export interface ChatClient {
  listConversations(signal: AbortSignal): Promise<ChatConversationSummary[]>;
  getConversation(id: string, signal: AbortSignal): Promise<ChatConversation>;
  deleteConversation(id: string, signal: AbortSignal): Promise<void>;
  sendMessage(
    input: { conversationId?: string; message: string; language: string },
    options: { signal: AbortSignal; onDelta: (content: string) => void },
  ): Promise<GroundedChatResponse & { conversationId: string }>;
}

export interface ChatBookingClient {
  getBooking(bookingId: string, signal?: AbortSignal): Promise<Booking>;
  createBooking(command: CreateDemoBookingCommand): Promise<string>;
  createCheckout(bookingId: string): Promise<string>;
  checkIn(
    bookingId: string,
    flightLeg: "outbound" | "return",
  ): Promise<Booking["checkIns"][number]>;
}

export class TripOperationError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "TripOperationError";
  }
}
