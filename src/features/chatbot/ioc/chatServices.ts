import type {
  listConversationsUseCase,
  getConversationUseCase,
  deleteConversationUseCase,
  sendMessageUseCase,
} from "../domain/useCases/clientChatUseCases";
import { injector } from "@/src/ioc/utils/injector";
import { ChatSymbols } from "./ChatSymbols";

export const chatServices = {
  listConversations: injector<ReturnType<typeof listConversationsUseCase>>(
    ChatSymbols.listConversations,
  ),
  getConversation: injector<ReturnType<typeof getConversationUseCase>>(
    ChatSymbols.getConversation,
  ),
  deleteConversation: injector<ReturnType<typeof deleteConversationUseCase>>(
    ChatSymbols.deleteConversation,
  ),
  sendMessage: injector<ReturnType<typeof sendMessageUseCase>>(
    ChatSymbols.sendMessage,
  ),
};
