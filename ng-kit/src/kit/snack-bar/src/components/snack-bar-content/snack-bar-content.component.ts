import { Component, HostBinding, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

// NOTE: direct file import because of circular depencency
import { SnackBarDataInterface } from '../../types/snack-bar-data.interface';

@Component({
  selector: 'pe-snack-bar-content',
  templateUrl: 'snack-bar-content.component.html',
  styleUrls: ['./snack-bar-content.component.scss']
})
export class SnackBarContentComponent {
  @HostBinding('style.width') get styleWidth(): string {
    return this.data.width || 'auto';
  }
  defaultIconSize: number = 24;

  get iconClass(): string {
    return `icon icon-${this.data.iconSize || this.defaultIconSize}`;
  }

  constructor(
    public snackBarRef: MatSnackBarRef<SnackBarContentComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: SnackBarDataInterface
  ) {}

  close(): void {
    this.snackBarRef.dismiss();
  }
}
