import { CurrencyPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { AddressInterface } from '@pe/forms-core';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';

import { TransactionDetailsSections, TimelineInterface, SectionsSubTitlesInterface, HIDDEN_VALUE } from '../../shared';
import { DetailsState } from '../store';

@Injectable()
export class SectionsService {

  sectionKeys: TransactionDetailsSections[] = Object.keys(TransactionDetailsSections).map(
    (key: string) => TransactionDetailsSections[key],
  );

  activeSection: TransactionDetailsSections = null;
  sectionsWithErrors: string[] = [];

  constructor(
    private currency: CurrencyPipe,
    private translateService: TranslateService,
    private localeConstantsService: LocaleConstantsService,
    private store: Store,
  ) {}

  public reset(): void {
    this.activeSection = null;
  }

  public prepareSectionsSubTitle(
    timelineItems: TimelineInterface[],
    locale: string,
  ): SectionsSubTitlesInterface {
    const order = this.store.selectSnapshot(DetailsState.order);
    const quantity = this.store.selectSnapshot(DetailsState.quantity);

    const sectionsSubTitles = {
      products: this.translateService.translate('transactions.sections.products.subtitle', { amount: quantity }),
      order: this.translateService.translate('transactions.sections.order.subtitle', { id: order?.transaction.original_id }),
      shipping: order?.shipping?.method_name?.toUpperCase()
        || order.shipping?.address ? this.getNameString(order.shipping?.address) : '-',
      billing: this.getNameString(order.billing_address),
      payment: this.translateService.translate('integrations.payments.' + order.payment_option.type + '.title'),
      seller: this.translateService.translate('transactions.sections.seller.title'),
      timeline: timelineItems[0]?.text,
      details: this.translateService.translate('transactions.sections.details.subtitle', {
        total: this.currency.transform(order.transaction.total_left || 0, order.transaction.currency, undefined, undefined, locale),
      }),
    };

    return sectionsSubTitles;
  }

  public getAddressString(address: AddressInterface): string {
    const addressElements: string[] = [];

    address.street && addressElements.push(address.street);
    address.zip_code && addressElements.push(address.zip_code);
    address.city && addressElements.push(address.city);
    address.country && addressElements.push(this.localeConstantsService.getCountryList()[address.country]);

    const filtered = addressElements.filter(d => !!d && !d.includes(HIDDEN_VALUE));

    if (!filtered.length) {
      return HIDDEN_VALUE;
    }

    return filtered.join(', ');
  }

  public getNameString(address: AddressInterface): string {
    let nameElements: string[] = [];

    address.salutation && nameElements.push(
      this.translateService.translate(`salutation.${address.salutation}`)
    );
    address.first_name && nameElements.push(address.first_name);
    address.last_name && nameElements.push(address.last_name);

    const filtered = nameElements.filter(d => !!d && !d.includes(HIDDEN_VALUE));

    if (!filtered.length) {
      return HIDDEN_VALUE;
    }

    return filtered.join(' ');
  }
}
