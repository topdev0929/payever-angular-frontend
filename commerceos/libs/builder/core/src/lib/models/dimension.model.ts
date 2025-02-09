import { PebSize } from './size.model';

export interface PebDimension {
  width?: PebSize;
  height?: PebSize;
  minWidth?: PebSize;
  minHeight?: PebSize;
  maxHeight?: PebSize;
  fullDeviceHeight?: boolean;
}
