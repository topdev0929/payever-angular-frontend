import {
  PeSocialPostStatusesEnum,
  PeSocialPostTypesEnum,
} from '../enums';

export interface PeSocialPostInterface {
  _id?: string;
  applicationScopeElasticId?: string;
  channelSet?: string[];
  content?: string;
  createdAt?: string;
  media?: File[];
  parentFolderId?: string;
  previewUrl?: string;
  productId?: string[];
  serviceEntityId?: string;
  status: PeSocialPostStatusesEnum;
  title?: string;
  toBePostedAt?: string;
  type: PeSocialPostTypesEnum;
  updatedAt?: string;
  postedAt?: string;
  url?: string;
}

export interface PeSocialPostRuleInteface {
  integrationName: string,
  propertyName: string,
  ruleType: string,
  regEx?: string,
  lettersCount?: number,
  extensionsSupported?: string
  mediaCount?: number,
  memorySize?: number,
  createdAt?: string,
  updatedAt?: string,
  _id?: string
}