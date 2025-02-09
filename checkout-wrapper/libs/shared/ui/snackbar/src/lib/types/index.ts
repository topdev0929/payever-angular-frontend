import { MatSnackBarRef } from '@angular/material/snack-bar';

import { SnackBarContentComponent } from '../components/snack-bar-content/snack-bar-content.component';

export enum SnackBarVerticalPositionType {
  Top = 'top',
  Bottom = 'bottom'
}

export type SnackBarRef = MatSnackBarRef<SnackBarContentComponent>;

export interface SnackBarConfig {
  duration?: number;
  position?: SnackBarVerticalPositionType;
  iconId?: string;
  iconSize?: number;
  showClose?: boolean;
  panelClass?: string | string[];
  width?: string;
}

export interface SnackBarDataInterface {
  content: string;
  iconId: string;
  iconSize?: number;
  showClose?: boolean;
  width?: string;
}
