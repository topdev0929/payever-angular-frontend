import { PeChatMessage } from ".";

export interface ContextMenuParam {
  selectedText: string;
  isSelectedZone: boolean;
  message: PeChatMessage;
  selectedMessages: PeChatMessage[];
  isChatMode: boolean;
  isPinned: boolean;
  isEditable: boolean;
}
