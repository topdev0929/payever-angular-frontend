/* eslint-disable no-unused-vars */
import { BehaviorSubject } from 'rxjs';

import { PeFilterType } from '@pe/grid/shared';
import { TextEditorPlaceholderItem } from '@pe/text-editor';

export enum ActionType {
  Duplicate = 'duplicate',
  Add = 'add',
  Edit = 'edit',
  Delete = 'delete',

};

export enum RuleAction {
  Schedule = 'schedule',
  Remind = 'remind',
  Chat = 'chat',
  Mail = 'email',
  Condition = 'condition',
  Move = 'move',
  Copy = 'copy',
}

export type ConditionActionDataType = {
  type: RuleAction.Condition;
  field: string;
  condition: string;
  values: string[];
}

export type MoveActionDataType = {
  type: RuleAction.Move;
  folderId: string;
}

export type CopyActionDataType = {
  type: RuleAction.Copy;
  folderId: string;
}

export type MailActionDataType = {
  type: RuleAction.Mail;
  email: {
    subject: string;
    cc?: string;
    body: string;
  }
}

export type ActionDataType = ConditionActionDataType
  | MoveActionDataType
  | CopyActionDataType
  | MailActionDataType;

export interface RuleModel {
  _id: string;
  businessId: string;
  name: string;
  description: string;
  actions: ActionDataType[];
}


export interface ActionCallback {
  action?: ActionType;
  rule?: RuleModel
}

export interface ActionModel {
  ruleData: RuleModel;
  action: ActionType;
  callback$?: BehaviorSubject<ActionCallback>
}

export interface RuleAppAction {
  label: string;
  value: string;
}

export interface RuleChannels {
  label: string;
  value: string;
}

export interface RuleConditions {
  label: string;
  value: string;
}

export interface RuleFieldOptions {
  label: string;
  value: string;
}

export interface RuleFields {
  fieldName: string;
  label: string;
  conditions: string[];
  type: PeFilterType,
  options: RuleFieldOptions[];
}

export interface RuleValues {
  actions: RuleAppAction[];
  conditions: RuleConditions[];
  channels: RuleChannels[],
  fields: RuleFields[],
}

export interface RuleFolder {
  business: string;
  children: any[];
  image: string;
  name: string;
  _id: string;
}

export interface RuleOverlayData {
  conditions: RuleConditions[];
  fields: RuleFields[];
  rules: RuleModel[];
  action?: ActionType;
  actions: RuleAppAction[];
  folders: RuleFolder[];
  channels: RuleChannels[];
  rule?: RuleModel;
}

export interface Action {
  type: RuleAction;
  icon: string;
  title: string;
  disabled: boolean;
  nextRequiredActions?: RuleAction[];
  nextActionSuggests?: RuleAction[];
}

export const START_LIST = [
  { label: 'rule.start.immediately', value: 'immediately' },
  { label: 'rule.start.time', value: 'time' },
];

export const ACTION_LIST: Action[] = [
  {
    type: RuleAction.Condition,
    icon: '#icon-rule-condition',
    title: 'If',
    disabled: false,
    nextActionSuggests: [RuleAction.Mail, RuleAction.Move, RuleAction.Copy],
  },
  {
    type: RuleAction.Move,
    icon: '#icon-rule-move',
    title: 'Move',
    disabled: false,
    nextRequiredActions: [RuleAction.Remind, RuleAction.Chat, RuleAction.Condition, RuleAction.Move],
    nextActionSuggests: [RuleAction.Condition, RuleAction.Mail],
  },
  {
    type: RuleAction.Copy,
    icon: '#icon-rule-copy',
    title: 'Copy',
    disabled: false,
    nextRequiredActions: [RuleAction.Remind, RuleAction.Chat, RuleAction.Condition, RuleAction.Move],
    nextActionSuggests: [RuleAction.Condition, RuleAction.Mail, RuleAction.Move],
  },
  {
    type: RuleAction.Mail,
    icon: '#icon-rule-mail',
    title: 'Mail',
    nextActionSuggests: [RuleAction.Condition, RuleAction.Move, RuleAction.Copy],
    disabled: false,
  },
  {
    type: RuleAction.Schedule,
    icon: '#icon-rule-calendar',
    title: 'Schedule',
    disabled: true,
    nextRequiredActions: [RuleAction.Remind, RuleAction.Chat, RuleAction.Condition, RuleAction.Move],
    nextActionSuggests: [RuleAction.Move],
  },
  {
    type: RuleAction.Remind,
    icon: '#icon-rule-clock-fill',
    title: 'Remind',
    disabled: true,
  },
  {
    type: RuleAction.Chat,
    icon: '#icon-commerceos-message',
    title: 'Chat',
    disabled: true,
  },
];

export const CONTACT_PLACEHOLDER_DATA: TextEditorPlaceholderItem[] = [
  {
    name: 'Contacts',
    value: 'contacts',
    children: [
      {
        name: 'First Name',
        value: 'contactFirstName',
      },
      {
        name: 'Last Name',
        value: 'contactLastName',
      },
      {
        name: 'Email',
        value: 'contactEmail',
      },
      {
        name: 'Phone',
        value: 'contactPhone',
      },
    ],
  },
  {
    name: 'Business',
    value: 'business',
    children: [
      {
        name: 'Name',
        value: 'businessName',
      },
      // {
      //   name: 'Phone',
      //   value: 'businessPhone',
      // },
      // {
      //   name: 'Email',
      //   value: 'businessEmail',
      // },
    ],
  },
];
