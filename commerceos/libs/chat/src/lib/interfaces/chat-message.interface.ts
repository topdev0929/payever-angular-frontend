export interface PeChatMessageSend {
  sender: string,
  message?: string,
  files?: File[],
  withSender?: boolean;
}

export interface PeChatMessageForward {
  messaging: string;
  messagingTitle: string;
  sender: string;
  senderTitle: string;
 _id: string;
}

