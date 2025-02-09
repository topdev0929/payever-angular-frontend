import {Component, Input, Injector, OnInit, ChangeDetectorRef} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PaymentMethodEnum } from '../../../../../shared';
import { BasePaymentComponent } from '../base-payment.component';

@Component({
  selector: 'payment-external-authentication',
  templateUrl: './payment-external-authentication.component.html',
  styleUrls: ['./payment-external-authentication.component.scss']
})
export class PaymentExternalAuthenticationComponent extends BasePaymentComponent implements OnInit {

  @Input() paymentMethod: PaymentMethodEnum;
  @Input() paymentIndex: number = 0;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private activatedRoute: ActivatedRoute = this.injector.get(ActivatedRoute);
  private changeDetectorRef: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();
    if (this.paymentsStateService.isExternalAuthSuccess(this.activatedRoute.snapshot.queryParams)) {
      this.isLoading$.next(true);
      this.paymentReadyFirst$.subscribe(payment => {
        this.paymentsStateService.enableExternalPaymentMethod(payment).subscribe(() => {

          this.isLoading$.next(false);
        }, error => {
          this.isLoading$.next(false);
          this.handleError(error, true);
        });
      });
    }
  }

  onSubmit(): void {
    this.isLoading$.next(true);
    if (this.isVariantStatusConnected(this.paymentIndex)) {
      this.paymentsStateService.resetCredentails(this.payment, this.payment.variants[this.paymentIndex]).pipe(takeUntil(this.destroyed$)).subscribe(data => {
        this.changeDetectorRef.detectChanges();
        this.isLoading$.next(false);
      }, error => {
        // TODO Maybe should set errors from bag?
        this.isLoading$.next(false);
        this.handleError(error, true);
      });
    } else {
      this.paymentsStateService.redirectToExternalAuth(this.payment.variants[this.paymentIndex]).pipe(takeUntil(this.destroyed$)).subscribe(data => {}, () => {
        this.isLoading$.next(false);
        this.showStepError(this.translateService.translate('categories.payments.auth.external.errors.cant_redirect'));
      });
    }
  }
}
