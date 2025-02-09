import { DataUrlType } from '../enums';
import { QROptions } from './qr.options';

export interface DataUrlQROptions extends QROptions {
  type?: DataUrlType;
}
