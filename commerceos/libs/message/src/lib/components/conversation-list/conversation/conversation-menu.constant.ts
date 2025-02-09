import { PeGridMenu } from '@pe/grid';
import { PeMessageConversationActionsEnum } from '@pe/message/shared';
import { PeMessageChat } from '@pe/shared/chat';
import { FolderItem } from '@pe/shared/folders';


export function PE_MESSAGE_CONVERSATION_MENU(chat: PeMessageChat, selectedFolder?: FolderItem): PeGridMenu {
  return {
    items: [
      {
        label: 'message-app.sidebar.add_to_folder',
        value: PeMessageConversationActionsEnum.AddToFolder,
      },
      {
        label: 'message-app.sidebar.exclude_from_current_folder',
        value: PeMessageConversationActionsEnum.ExcludeFromFolder,
        hidden: !chat.locations?.map(item=>item.folderId).includes(selectedFolder?._id),
      },
      {
        label: 'message-app.sidebar.delete_and_leave',
        value: PeMessageConversationActionsEnum.LeaveChat,
      },
    ],
    title: 'message-app.sidebar.options',
  };
}
