import type {
  ChatBookingClient,
  ChatClient,
} from "../domain/repositories/ChatClient";
import { injector } from "@/src/ioc/utils/injector";
import { CHAT_BOOKING_CLIENT, CHAT_CLIENT } from "./ChatModule";

export const chatServices = {
  client: injector<ChatClient>(CHAT_CLIENT),
  bookingClient: injector<ChatBookingClient>(CHAT_BOOKING_CLIENT),
};
