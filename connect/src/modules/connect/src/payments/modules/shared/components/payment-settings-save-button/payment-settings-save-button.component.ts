import { Component, Input, Injector } from '@angular/core';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, of } from 'rxjs';
import { delay, flatMap, takeUntil } from 'rxjs/operators';

import { PaymentMethodEnum } from '../../../../../shared';
import { BasePaymentComponent } from '../base-payment.component';
import { SettingsOptionsInterface } from '../base-main.component';

@Component({
  selector: 'payment-settings-save-button',
  templateUrl: './payment-settings-save-button.component.html',
  styleUrls: ['./payment-settings-save-button.component.scss']
})
export class PaymentSettingsSaveButtonComponent extends BasePaymentComponent {

  @Input() paymentMethod: PaymentMethodEnum;
  @Input() paymentIndex: number = 0;
  @Input() data: SettingsOptionsInterface;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(injector: Injector) {
    super(injector);
  }

  onSubmit(): void {
    this.isLoading$.next(true);
    this.paymentReadyFirst$.subscribe(payment => {
      const saveOptions$ = isEqual(this.data.options || {}, {}) ? of(null) : this.paymentsStateService.saveOptions(this.data.options, payment.variants[this.paymentIndex]);
      const saveSettings$ = isEqual(this.data.settings || {}, {}) ? of(null) : this.paymentsStateService.saveSettings(this.data.settings, payment, payment.variants[this.paymentIndex]);

      saveOptions$.pipe(flatMap(() => {
        return saveSettings$;
      })).pipe(
        delay(200), // For better user UI
        takeUntil(this.destroyed$)
      ).subscribe(() => {
        this.isLoading$.next(false);
      }, error => {
        this.handleError(error, true);
        this.isLoading$.next(false);
      });
    });
  }
}
