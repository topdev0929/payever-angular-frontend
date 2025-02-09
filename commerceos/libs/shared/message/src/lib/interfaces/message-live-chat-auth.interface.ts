export interface PeMessageLiveChatAuthInterface {
  businessId: string;
  token?: string;
}

export interface LiveChatGuestTokenCacheData {
  peLiveChatToken: string;
  peLiveChatBusinessId: string;
  conversationId?: string;
  visitorHash: string;
}
