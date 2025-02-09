import { Component, Inject, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, merge, Observable } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AddressInterface, FlowInterface } from '@pe/checkout-types';
import { PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { CheckoutMicroService } from '@pe/shared/checkout';

import { RootCheckoutWrapperService } from '../../../../services';
import { CreateFlowParamsInterface } from '../../../interfaces';
import { PaymentLinksApiService } from '../../../services';



@Component({
  selector: 'pe-payment-link-prefill',
  templateUrl: './payment-link-prefill.component.html',
  styles: [`
    .checkout-main-content {
      height: 100%;
      width: 100%;
      border-radius: 12px;
      position: relative;
      overflow: hidden;

      root-checkout-wrapper{
        display: block;
      }
      .loading-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  `],
  providers: [PeDestroyService],
})
export class PaymentLinkPrefillComponent implements OnInit {
  constructor(
    private readonly destroy$: PeDestroyService,
    public wrapperService: RootCheckoutWrapperService,
    private translateService: TranslateService,
    private confirmScreenService: ConfirmScreenService,
    @Inject(PE_OVERLAY_DATA) public overlayData: {
      onSave$: Observable<void>
      onCancel$: Observable<void>,
      close(): void
      paymentLinkId: string
    },
    private checkoutMicroService: CheckoutMicroService,
    private apiService: PaymentLinksApiService,
  ) {
    this.overlayData.onCancel$.pipe(
      switchMap(() => {
        const config: Headings = {
          title: this.translateService.translate('paymentLinks.dialog.confirm.prefill.title'),
          subtitle: this.translateService.translate('paymentLinks.dialog.confirm.prefill.subtitle'),
          confirmBtnText: this.translateService.translate('warning-modal.actions.yes'),
          declineBtnText: this.translateService.translate('warning-modal.actions.no'),
        };

        return this.confirmScreenService.show(config, true);
      }),
      filter(confirm => confirm),
      tap(() => {
        this.overlayData.close();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public createFlowParams$ = new BehaviorSubject<CreateFlowParamsInterface>(null)


  isHidden$ = this.wrapperService.isCustomElementReady$.pipe(
    map(v=>!v)
  );

  public readonly remote$ = this.checkoutMicroService.remote$

  ngOnInit(): void {
    this.wrapperService.setCustomElementReady(false);
    const createFlowParams$ = combineLatest([
      this.wrapperService.channelSetId$,
      this.apiService.getApiCallFlow(this.overlayData.paymentLinkId),
    ]).pipe(
      tap(([channelSetId, res]) => {
        this.createFlowParams$.next({
          channelSetId: res.channelSetId || channelSetId,
          flowRawData: this.mapPaymentLinkToFlowData(res),
        });
        this.wrapperService.showCheckout(true);
      }),
    );

    const onSave$ = this.overlayData.onSave$.pipe(
      tap(() => {
        this.wrapperService.preparePrefilled((data) => {
          this.overlayData.close();
        }, this.overlayData.paymentLinkId);
      }),
    );
    this.wrapperService.setParams(this.wrapperService.defaultParams);

    merge(
      createFlowParams$,
      onSave$,
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private mapPaymentLinkToFlowData(data: FlowInterface): FlowInterface {
    return {
      ...data,
      shippingAddress: this.isAddressValid(data.shippingAddress)
        ? data.shippingAddress
        : undefined,
      billingAddress: this.isAddressValid(data.billingAddress)
        ? data.billingAddress
        : undefined,
    };
  }

  private isAddressValid(address: AddressInterface) {
    return address.country && address.email
      && address.city
      && address.firstName
      && address.lastName
      && address.street
      && address.zipCode;
  }
}

