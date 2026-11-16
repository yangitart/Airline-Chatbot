export const ChatSymbols = {
  dataSource: Symbol("ChatApiDataSource"),
  repository: Symbol("ChatRepository"),
  listConversations: Symbol("ListChatConversations"),
  getConversation: Symbol("GetChatConversation"),
  deleteConversation: Symbol("DeleteChatConversation"),
  sendMessage: Symbol("SendChatMessage"),
} as const;
