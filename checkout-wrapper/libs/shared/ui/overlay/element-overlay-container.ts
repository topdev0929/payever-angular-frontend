import { OverlayContainer } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Optional } from '@angular/core';

import { CustomElementService } from '@pe/checkout/utils';


@Injectable()
export class ElementOverlayContainer extends OverlayContainer {
  constructor(
    @Inject(DOCUMENT) document: Document,
    protected _platform: Platform,
    @Optional() private customElementService: CustomElementService,
  ) {
    super(document, _platform);
  }

  override getContainerElement(): HTMLElement {
    if (!this._containerElement || !this._rootNode()?.contains(this._containerElement)) {
      this._createContainer();
    }

    return this._containerElement;
  }

  override _createContainer(): void {
    const containerClass = 'checkout-cdk-overlay-container';

    super._createContainer();

    this._containerElement.classList.add(containerClass);
    this.customElementService.shadowRoot && this._rootNode().appendChild(this._containerElement);
  }

  private _rootNode(): Element | ShadowRoot {
    return this.customElementService.shadowRoot?.querySelector('.pe-checkout-bootstrap')
      ?? this.customElementService.shadowRoot
      ?? this.customElementService?.elementRef?.nativeElement
      ?? this._document.body;
  }
}
