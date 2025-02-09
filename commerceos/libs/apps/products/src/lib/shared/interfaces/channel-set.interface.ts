import { AppInstanceEnum } from '../enums/app.enum';
import { ChannelTypes } from '../enums/product.enum';

export interface ChannelSetInterface {
  id: string | number;
  active?: boolean;
  type: ChannelTypes | AppInstanceEnum;
  name?: string;
}

export interface ChannelSetChangeEventInterface {
  channel: ChannelSetInterface;
  isChecked: boolean;
}
