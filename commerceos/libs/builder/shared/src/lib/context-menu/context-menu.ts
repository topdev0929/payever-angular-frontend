import { PebElement } from '@pe/builder/render-utils';

export enum PebContextMenuCommands {
  Save = 'save',
  Group = 'group',
  Ungroup = 'ungroup',
  Copy = 'copy',
  Paste = 'paste',
  BringFront = 'bring-front',
  SendBack = 'send-back',
  ClearStyles = 'clear-styles',
}

export interface PebContextMenuState {
  canGroup: boolean;
  canUngroup: boolean;
  canDelete: boolean;
  addSection: boolean;
  canSave: boolean;
  canCopy: boolean;
  canPaste: boolean;
  canBringFront: boolean;
  canSendBack: boolean;
  canClearStyles: boolean;
}

export const getGroupId = (element: PebElement, openGroup: string) => {
  if (element.data?.groupId?.length) {
    return openGroup
      ? element.data.groupId[Math.max(element.data.groupId.indexOf(openGroup) - 1, 0)]
      : element.data.groupId.slice(-1).pop();
  }

  return undefined;
};
