import { Category } from './category.interface';

export interface ChannelSetCategoriesInterface {
  channelSetId: string;
  categories: Category[];
  channelSetType: string;
}
