import type { ChatRepository } from "../domain/repositories/ChatRepository";
import { ContainerModule } from "inversify";
import {
  ChatApiDataSourceImpl,
  type ChatApiDataSource,
} from "../data/data_sources/ChatApiDataSource";
import { ChatRepositoryImpl } from "../data/repositories/ChatRepositoryImpl";
import {
  listConversationsUseCase,
  getConversationUseCase,
  deleteConversationUseCase,
  sendMessageUseCase,
} from "../domain/useCases/clientChatUseCases";
import { applyDependencies } from "@/src/ioc/utils/applyDependencies";
import { NetWorkDataModuleSymbols } from "@/src/ioc/common/network.module";
import { ChatSymbols } from "./ChatSymbols";

export const ChatModule = new ContainerModule((bind) => {
  bind<ChatApiDataSource>(ChatSymbols.dataSource).toConstantValue(
    applyDependencies(ChatApiDataSourceImpl, [
      NetWorkDataModuleSymbols.REST_CLIENT,
    ]),
  );
  bind<ChatRepository>(ChatSymbols.repository).toConstantValue(
    applyDependencies(ChatRepositoryImpl, [ChatSymbols.dataSource]),
  );
  bind<ReturnType<typeof listConversationsUseCase>>(
    ChatSymbols.listConversations,
  ).toConstantValue(
    applyDependencies(listConversationsUseCase, [ChatSymbols.repository]),
  );
  bind<ReturnType<typeof getConversationUseCase>>(
    ChatSymbols.getConversation,
  ).toConstantValue(
    applyDependencies(getConversationUseCase, [ChatSymbols.repository]),
  );
  bind<ReturnType<typeof deleteConversationUseCase>>(
    ChatSymbols.deleteConversation,
  ).toConstantValue(
    applyDependencies(deleteConversationUseCase, [ChatSymbols.repository]),
  );
  bind<ReturnType<typeof sendMessageUseCase>>(
    ChatSymbols.sendMessage,
  ).toConstantValue(
    applyDependencies(sendMessageUseCase, [ChatSymbols.repository]),
  );
});
