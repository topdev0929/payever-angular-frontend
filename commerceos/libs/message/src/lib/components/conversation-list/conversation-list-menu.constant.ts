import { PeGridMenu } from '@pe/grid';
import { PeMessageConversationListActionsEnum } from '@pe/message/shared';

export const PE_MESSAGE_CONVERSATION_LIST_MENU: PeGridMenu = {
  items: [
    {
      label: 'message-app.sidebar.mail',
      value: PeMessageConversationListActionsEnum.CreateMailMessage,
      disabled: true,
    },
    {
      label: 'message-app.sidebar.channel',
      value: PeMessageConversationListActionsEnum.CreateChannel,
    },
  ],
  title: 'message-app.sidebar.add_new',
};
