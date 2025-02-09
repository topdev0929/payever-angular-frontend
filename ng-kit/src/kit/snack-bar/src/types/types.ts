import { MatSnackBarRef } from '@angular/material/snack-bar';
import { SnackBarContentComponent } from '../components/snack-bar-content/snack-bar-content.component';

export enum SnackBarVerticalPositionType {
  // Same types as in MatSnackBarVerticalPosition
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
