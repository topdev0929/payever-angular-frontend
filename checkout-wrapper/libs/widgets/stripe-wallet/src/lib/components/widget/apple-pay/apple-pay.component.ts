import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
} from '@angular/core';
import { Stripe } from '@stripe/stripe-js';
import { Subject, defer, of } from 'rxjs';
import { catchError, filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PaymentMethodEnum } from '@pe/checkout/types';
import { SnackBarModule, SnackBarService, SnackBarVerticalPositionType } from '@pe/checkout/ui/snackbar';
import { fromIntersectionObserver } from '@pe/checkout/utils/from-intersection-observer';
import { PE_ENV } from '@pe/common';
import { PeDestroyService } from '@pe/destroy';

import { COMPONENT_CONFIG } from '../../../constants';
import { PayService, PaymentRequestAdapter } from '../../../services';

@Component({
  selector: 'pe-apple-pay',
  template: `
  <button
    *ngIf="init$ | async"
    #button
    class="button"
    [style.minWidth.px]="componentConfig.config.minWidth"
    [style.maxWidth.px]="componentConfig.config.maxWidth"
    [style.minHeight.px]="componentConfig.config.minHeight"
    [style.height.px]="componentConfig.config.maxHeight"
    [ngClass]="componentConfig.theme"
    [style.backgroundImage]="backgroundImage"
    (click)="pay()">
  </button>
  `,
  styleUrls: [
    '../pay.component.scss',
    './apple-pay.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgClass,
    SnackBarModule,
  ],
  providers: [
    PayService,
    PeDestroyService,
  ],
})
export class ApplePayComponent {

  protected readonly componentConfig = inject(COMPONENT_CONFIG);
  private readonly elementRef = inject(ElementRef);
  private readonly env = inject(PE_ENV);
  private readonly payService = inject(PayService);
  private readonly snackbar = inject(SnackBarService);
  private readonly destroy$ = inject(PeDestroyService);

  private stripe: Stripe;
  private paymentRequest: PaymentRequestAdapter;

  protected readonly init$ = defer(() => fromIntersectionObserver(this.elementRef).pipe(
    filter(e => e.isIntersecting),
    switchMap(() => this.payService.init(
      this.componentConfig,
      PaymentMethodEnum.APPLE_PAY,
    ).pipe(
      tap(({ paymentRequest, stripe }) => {
        this.paymentRequest = paymentRequest;
        this.stripe = stripe;
      })),
    ),
    catchError((err) => {
      this.snackbar.show(err.message, {
        duration: 5000,
        position: SnackBarVerticalPositionType.Top,
        panelClass: 'stripe-wallet-mat-snack-bar-container-fixed',
      });

      return of(null);
    }),
    take(1),
  ));

  private readonly paySubject$ = new Subject<void>();
  private readonly pay$ = this.paySubject$.pipe(
    switchMap(() => this.payService.pay(
      this.componentConfig,
      PaymentMethodEnum.APPLE_PAY,
      this.paymentRequest,
      this.stripe,
    ).pipe(
      catchError((err) => {
        this.snackbar.show(err.message, {
          duration: 5000,
          position: SnackBarVerticalPositionType.Top,
          panelClass: 'stripe-wallet-mat-snack-bar-container-fixed',
        });

        return of(null);
      }),
    )),
  );

  protected get backgroundImage () {
    return `url(${this.env.custom.cdn}/payment-widgets/icons/${this.componentConfig.theme}-theme-apay.svg)`;
  }

  ngOnInit(): void {
    this.pay$.pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  protected pay() {
    if (this.componentConfig.isDebugMode) {
      return;
    }

    try {
      this.paymentRequest.show();
      this.paySubject$.next();
    } catch (err) {
      this.snackbar.show((err as any).message ?? err, {
        duration: 5000,
        position: SnackBarVerticalPositionType.Top,
        panelClass: 'stripe-wallet-mat-snack-bar-container-fixed',
      });
    }
  }
}
