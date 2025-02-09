import { DialogButtonListInterface } from './dialog-button.interface';
import { DialogConfigInterface } from './dialog-config.interface';

export interface DialogButtonPresetsInterface {
  [key: string]: DialogButtonListInterface;
}

export interface DialogConfigPresetsInterface {
  [key: string]: DialogConfigInterface;
}
