import { ChangeDetectorRef, Directive, Injector } from '@angular/core';
import { ViewSelectSnapshot } from '@ngxs-labs/select-snapshot';

import { EnvService } from '@pe/common';
import { AddressService } from '@pe/forms-core';
import { LocaleConstantsService } from '@pe/i18n';

import { DetailService, SectionsService } from '../details/services';
import { DetailsState } from '../details/store';
import { DetailInterface, DetailsStatusInterface, DetailsTransactionInterface } from '../shared';


@Directive()

// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class BaseSectionClass {
  @ViewSelectSnapshot(DetailsState.order) public order: DetailInterface

  protected detailService = this.injector.get(DetailService);
  protected addressService = this.injector.get(AddressService);
  protected localeConstantsService = this.injector.get(LocaleConstantsService);
  protected cdr = this.injector.get(ChangeDetectorRef);
  protected envService = this.injector.get(EnvService);
  private sectionsService = this.injector.get(SectionsService);

  get cart(): DetailInterface['cart'] {
    return this.order?.cart;
  }

  get transaction(): DetailsTransactionInterface {
    return this.order?.transaction;
  }

  get status(): DetailsStatusInterface {
    return this.order?.status;
  }

  get billingAddressName(): string {
    return this.sectionsService.getNameString(this.order.billing_address);
  }

  get billingAddress(): string {
    return this.sectionsService.getAddressString(this.order.billing_address);
  }

  get shippingAddressName(): string {
    return this.sectionsService.getNameString(this.order.shipping.address);
  }

  get shippingAddress(): string {
    return this.sectionsService.getAddressString(this.order.shipping.address);
  }

  get locale(): string {
    return this.localeConstantsService.getLocaleId();
  }

  constructor(
    protected injector: Injector,
  ) { }
}
