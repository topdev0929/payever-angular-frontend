import { OverlayContainer } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable()
export class CheckoutOverlayContainer extends OverlayContainer {
  constructor(
    @Inject(DOCUMENT) document: Document,
    protected _platform: Platform,
  ) {
    super(document, _platform);
  }

  _createContainer(): void {
    const containerClass = 'checkout-cdk-overlay-container';

    super._createContainer();

    this._containerElement.classList.add(containerClass);
  }
}
