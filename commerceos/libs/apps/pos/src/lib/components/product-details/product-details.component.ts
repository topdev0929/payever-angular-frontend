import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

import { TranslateService } from '@pe/i18n';
import { PeSharedCheckoutCartService } from '@pe/shared/checkout';
import { SnackbarService } from '@pe/snackbar';

import { OptionsContainer, PePosProductInterface } from '../../misc/interfaces/product.interface';
@Component({
  selector: 'pe-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailsComponent implements OnInit {
  @Input() product!: PePosProductInterface;
  @Input() options: OptionsContainer;
  @Output() closeClicked = new EventEmitter<void>();

  @ViewChild(MatMenuTrigger) menuTriggerRef: MatMenuTrigger;

  public isVariantProduct = false;
  selectedVariant = null;

  constructor(
    private cartService: PeSharedCheckoutCartService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    if (this.product.variants.length > 0) {
      this.isVariantProduct = true;
      this.product.variants.forEach(variant => variant.title = this.getVariantTitle(variant));
    }
  }

  addToCart() {
    this.cartService.addCartItem(this.product, this.selectedVariant);
    this.snackbarService.toggle(true, {
      content: this.translateService.translate(`pos-app.info.product_added_cart`),
      hideButtonTitle: this.translateService.translate(`pos-app.info.hide_btn`),
      duration: 2000,
      useShowButton: false,
    });
    this.closeDetail();
  }

  updateValue(event: Event, variant) {
    event.stopPropagation();
    this.selectedVariant = variant;
    this.menuTriggerRef.closeMenu();
  }

  closeDetail() {
    this.closeClicked.emit();
  }

  getVariantTitle(variant) {
    return variant?.options.map(opt => opt.value).join(',');
  }
}
