import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';

import { CheckoutElementAbstract } from '@pe/checkout-sdk/sdk/elements';

/** Main goal of this component is to:
 * - get input params
 * - get output events from children and dispatch them as outputs
 * - "bootstrap" our application - we're uploading translations here instead of guards, etc.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'checkout-cart-edit',
  templateUrl: './cart-edit.component.html',
  styleUrls: ['./cart-edit.component.scss'],
  // tslint:disable-next-line use-view-encapsulation
  encapsulation: ViewEncapsulation.None
})
export class CartEditComponent extends CheckoutElementAbstract  {

  submit$: EventEmitter<void> = new EventEmitter<void>();
  @Input('submit') set setsubmit(value: any) {
    if (this.checkInputEventEmit(value)) {
      this.submit$.next(this.parseInputEventEmit(value));
      this.updateCustomElementView();
    }
  }

  isUseInventory: boolean;
  @Input('isuseinventory') set setisuseinventory(value: any) {
    this.isUseInventory = this.parseInputBoolean(value);
  }

  isProductsRefreshDisabled: boolean;
  @Input('isproductsrefreshdisabled') set setisproductsrefreshdisabled(value: any) {
    this.isProductsRefreshDisabled = this.parseInputBoolean(value);
  }

  @Output() serviceReady: EventEmitter<boolean> = new EventEmitter();
  @Output() loading: EventEmitter<boolean> = new EventEmitter();
  @Output() submitted: EventEmitter<boolean> = new EventEmitter();

  constructor(
    protected injector: Injector
  ) {
    super(injector);
  }

  onServiceReadyChange(status: boolean): void {
    this.serviceReady.emit(status);
  }

  onLoadingChange(status: boolean): void {
    this.loading.emit(status);
  }

  onSubmittedChange(status: boolean): void {
    this.submitted.emit(status);
  }

  protected getMicroI18nDomains(): string[] {
    return ['checkout-cart-app'];
  }

  protected getIconsPack(): string[] {
    return [];
  }
}
