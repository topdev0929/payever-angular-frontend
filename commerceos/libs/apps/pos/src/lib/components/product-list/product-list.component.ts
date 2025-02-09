import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { map } from 'rxjs/operators';

import { PeSharedCheckoutCartService, PeSharedCheckoutService, PeSharedCheckoutStateService, WrapperType } from '@pe/shared/checkout';

import { PePosProductInterface } from '../../misc/interfaces/product.interface';

@Component({
  selector: 'pe-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnDestroy {
  @Input() products!: PePosProductInterface[];
  @Output() productSelected = new EventEmitter<PePosProductInterface>();

  isCartNotEmpty$ = this.cartService.cartItems$.pipe(map(data => !!data.length));

  constructor(
    private checkoutService: PeSharedCheckoutService,
    public stateService: PeSharedCheckoutStateService,
    private cartService: PeSharedCheckoutCartService,
  ) {
  }

  ngOnDestroy() {
    this.checkoutService.setCheckoutType(null);
  }

  onProductClicked(product: PePosProductInterface){
    this.productSelected.emit(product);
  }

  showCartClicked() {
    this.checkoutService.setCheckoutType(WrapperType.CheckoutWrapper);
  }

  showQrClicked() {
    this.checkoutService.setCheckoutType(WrapperType.CheckoutQrWrapper);
  }

  showAmountCheckout() {
    this.checkoutService.setCheckoutType(WrapperType.AmountWrapper);
  }

  trackByProductId(index: number, product: PePosProductInterface): string {
    return product.id;
  }
}
