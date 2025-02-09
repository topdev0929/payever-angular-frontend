import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Subject, of } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';

import { PaymentMethodEnum } from '@pe/checkout/types';
import { SnackBarModule, SnackBarService, SnackBarVerticalPositionType } from '@pe/checkout/ui/snackbar';
import { PE_ENV } from '@pe/common';
import { PeDestroyService } from '@pe/destroy';

import { COMPONENT_CONFIG } from '../../../constants';
import { PayService } from '../../../services';

@Component({
  selector: 'pe-google-pay',
  template: `
  <button
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
    './google-pay.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    AsyncPipe,
    NgClass,
    SnackBarModule,
  ],
  providers: [
    PayService,
    PeDestroyService,
  ],
})
export class GooglePayComponent implements OnInit {

  protected readonly componentConfig = inject(COMPONENT_CONFIG);
  private readonly env = inject(PE_ENV);
  private readonly payService = inject(PayService);
  private readonly snackbar = inject(SnackBarService);
  private readonly destroy$ = inject(PeDestroyService);

  private readonly paySubject$ = new Subject<void>();
  private readonly pay$ = this.paySubject$.pipe(
    switchMap(() => this.payService.init(
      this.componentConfig,
      PaymentMethodEnum.GOOGLE_PAY,
    ).pipe(
      switchMap(({ paymentRequest, stripe }) => {
        paymentRequest.show();

        return this.payService.pay(
          this.componentConfig,
          PaymentMethodEnum.GOOGLE_PAY,
          paymentRequest,
          stripe,
        );
      }),
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
    return `url(${this.env.custom.cdn}/payment-widgets/icons/${this.componentConfig.theme}-theme-gpay.svg)`;
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

    this.paySubject$.next();
  }
}
