import { PeMessageSideNavMenuActions } from '@pe/message/shared';

export const PE_MESSAGE_FOLDERS_MENU = {
  items: [
    {
      label: 'message-app.sidebar.folder',
      value: PeMessageSideNavMenuActions.Folder,
    },
    {
      label: 'message-app.sidebar.headline',
      value: PeMessageSideNavMenuActions.Headline,
    },
    {
      label: 'message-app.sidebar.rules',
      value: PeMessageSideNavMenuActions.Rules,
    },
  ],
  title: 'message-app.sidebar.add_new',
};
