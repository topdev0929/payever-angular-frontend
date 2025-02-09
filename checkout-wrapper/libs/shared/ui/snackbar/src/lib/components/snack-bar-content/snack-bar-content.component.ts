import { Component, HostBinding, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

import { CustomElementService } from '@pe/checkout/utils';

import { SnackBarDataInterface } from '../../types';

@Component({
  selector: 'pe-snack-bar-content',
  templateUrl: 'snack-bar-content.component.html',
  styleUrls: ['./snack-bar-content.component.scss'],
})
export class SnackBarContentComponent {
  @HostBinding('style.width') get styleWidth(): string {
    return this.data.width || 'auto';
  }

  defaultIconSize = 24;

  get iconClass(): string {
    return `icon icon-${this.data.iconSize || this.defaultIconSize}`;
  }

  constructor(
    protected customElementService: CustomElementService,
    public snackBarRef: MatSnackBarRef<SnackBarContentComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: SnackBarDataInterface
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['x-solid-24'],
      null,
      this.customElementService.shadowRoot);
  }

  close(): void {
    this.snackBarRef.dismiss();
  }
}
