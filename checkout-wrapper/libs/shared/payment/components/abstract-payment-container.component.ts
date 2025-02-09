import {
  Directive,
  OnInit,
} from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

import { AddressStorageService } from '@pe/checkout/storage';
import { GetPaymentOptions, PaymentState } from '@pe/checkout/store';

import { AbstractPaymentContainer } from '../models';
import { PAYMENT_SETTINGS } from '../tokens';

import { AbstractContainerComponent } from './abstract-container.component';

@Directive()
export abstract class AbstractPaymentContainerComponent
  extends AbstractContainerComponent
  implements OnInit, AbstractPaymentContainer {

  @Select(PaymentState.options)
  public nodeFormOptions$: Observable<any>;

  protected addressStorageService = this.injector.get(AddressStorageService);
  private paymentSettings = this.injector.get(PAYMENT_SETTINGS, null, {
    optional: true,
  });

  ngOnInit(): void {
    this.loadFormOptions();
  }

  private loadFormOptions(): void {
    const nodeFormOptions = this.store.selectSnapshot(PaymentState.options);
    if (this.paymentSettings?.hasNodeOptions
      && !nodeFormOptions
    ) {
      this.store.dispatch(new GetPaymentOptions());
    }
  }

}
