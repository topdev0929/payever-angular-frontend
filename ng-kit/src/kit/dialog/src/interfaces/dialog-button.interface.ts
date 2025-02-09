import { ThemePalette } from '@angular/material/core';
import { Observable } from 'rxjs';

import { DialogActions } from '../enums';

export type DialogButtonFunction = () => void;

export interface DialogButtonInterface {
  classes?: string;
  click?: DialogButtonFunction | DialogActions;
  color?: ThemePalette;
  dialogResult?: Observable<any>;
  disabled?: boolean;
  order?: number;
  text?: string;
}

export interface DialogButtonListInterface {
  [key: string]: DialogButtonInterface;
}
