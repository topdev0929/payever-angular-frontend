import { DialogPosition } from '@angular/material/dialog';

// tslint:disable-next-line no-empty-interface
export interface DialogPositionInterface extends DialogPosition {
}

export interface DialogConfigInterface {
  /** Whether the dialog has a backdrop. */
  hasBackdrop?: boolean;
  /** Whether the user can use escape or clicking outside to close a modal. */
  disableClose?: boolean;
  /** Width of the dialog. */
  width?: string;
  /** Height of the dialog. */
  height?: string;
  /** Min-width of the dialog. If a number is provided, pixel units are assumed. */
  minWidth?: number | string;
  /** Min-height of the dialog. If a number is provided, pixel units are assumed. */
  minHeight?: number | string;
  /** Max-width of the dialog. If a number is provided, pixel units are assumed. Defaults to 80vw */
  maxWidth?: number | string;
  /** Max-height of the dialog. If a number is provided, pixel units are assumed. */
  maxHeight?: number | string;
  /** Custom class for the overlay pane. */
  panelClass?: string | string[];
  /** Position overrides. */
  position?: DialogPositionInterface;
  /** ID of the element that describes the dialog. */
  ariaDescribedBy?: string | null;
  /** Aria label to assign to the dialog element */
  ariaLabel?: string | null;
  /** Whether the dialog should focus the first focusable element on open. */
  autoFocus?: boolean;
}
