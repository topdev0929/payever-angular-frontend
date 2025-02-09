import { PeMessageChat } from './message-chat.interface';

export interface PeMessageChannel extends PeMessageChat {
  inviteCode?: string;
  subType?: string;
}

export interface PeMessageChannelInfo {
  title?: string;
  description?: string;
  photo?: string;
  sign?: boolean;
  subType?: string;
  removedMembers?: any;
}

export interface PeMessageChannelMember {
  _id: string;
  title: string;
  avatar: string;
  initials: string;
}