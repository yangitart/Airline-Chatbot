import { ContainerModule } from "inversify";
import { chatApiClient } from "../data/data_sources/ChatApiClient";
import { createChatBookingClient } from "../data/data_sources/ChatBookingClient";
import type { ChatBookingClient, ChatClient } from "../domain/repositories/ChatClient";
import { NetWorkDataModuleSymbols } from "@/src/ioc/common/network.module";
import { applyDependencies } from "@/src/ioc/utils/applyDependencies";

export const CHAT_CLIENT = Symbol("ChatClient");
export const CHAT_BOOKING_CLIENT = Symbol("ChatBookingClient");

export const ChatModule = new ContainerModule((bind) => {
  bind<ChatClient>(CHAT_CLIENT).toConstantValue(chatApiClient);
  bind<ChatBookingClient>(CHAT_BOOKING_CLIENT).toConstantValue(
    applyDependencies(createChatBookingClient, [NetWorkDataModuleSymbols.REST_CLIENT]),
  );
});
