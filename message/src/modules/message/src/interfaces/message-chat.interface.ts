import { SafeStyle } from '@angular/platform-browser';

import { PeChatMessage } from '@pe/chat';

import { PeMessageChatType, PeMessageIntegration } from '../enums';

export interface PeMessageChatMember {
  role: string;
  user: string;
  _id: string;
}

export interface PeMessageChat {
  avatar?: SafeStyle;
  initials?: string;
  business?: string;
  contact?: string;
  deleted?: boolean;
  integrationName: PeMessageIntegration;
  lastMessages?: PeChatMessage[];
  messages?: PeChatMessage[];
  members?: PeMessageChatMember[];
  title: string;
  updatedAt?: Date;
  parentFolder?: string;
  salt?: string;
  _id?: string;
  lastSeen?: string;
  subType?: string;
  currentlyAnswering?: string;
  type?: PeMessageChatType;
  [propName: string]: any;
  signed?: boolean;
}
