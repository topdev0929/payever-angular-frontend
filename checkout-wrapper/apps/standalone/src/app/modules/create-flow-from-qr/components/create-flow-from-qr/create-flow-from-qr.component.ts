import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { EMPTY } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';

import { VerificationTypeEnum } from '@pe/checkout/api';
import { LoaderService } from '@pe/checkout/core/loader';
import { FlowStorage } from '@pe/checkout/storage';
import { AuthSelectors, CheckoutState, CreateFlow, FlowState } from '@pe/checkout/store';

@Component({
  selector: 'create-flow-from-qr',
  template: '',
})
export class CreateFlowFromQrComponent implements OnInit {

  @SelectSnapshot(AuthSelectors.guestTokenQueryParam)
  private readonly guestTokenQueryParam: Params;

  private activatedRoute: ActivatedRoute = this.injector.get(ActivatedRoute);
  private loaderService: LoaderService = this.injector.get(LoaderService);
  private router: Router = this.injector.get(Router);
  private store = this.injector.get(Store);
  private flowStorage = this.injector.get(FlowStorage);

  constructor(private injector: Injector) { }

  ngOnInit(): void {
    const params = this.activatedRoute.snapshot.params;
    const queryParams = this.activatedRoute.snapshot.queryParams;

    this.loaderService.loaderGlobal = true;
    this.store.dispatch(new CreateFlow({
      channelSetId: params.channelSetId,
      amount: parseFloat(queryParams.amount),
      reference: queryParams.reference,
      phoneNumber: queryParams.phoneNumber || queryParams.phone_number,
      source: queryParams.source || 'qr',
      generatePaymentCode: true,
      merchantMode: !!queryParams?.merchantMode,
    })).pipe(
      take(1),
      tap(() => {
        const flow = this.store.selectSnapshot(FlowState.flow);
        const channelSetSettings = this.store.selectSnapshot(CheckoutState.channelSetSettings);
        const byCode = channelSetSettings.verificationType === VerificationTypeEnum.VERIFY_BY_PAYMENT
          && channelSetSettings.secondFactor;

        this.flowStorage.setData(flow.id, 'paymentSource', {
          source: 'qr',
        });
        this.router.navigate(
          [`/pay/${flow.id}`],
          {
            queryParams: {
              forceHideReference: true,
              forcePhoneRequired: byCode,
              forceCodeForPhoneRequired: byCode,
              forceHideShareButton: true,
              ...this.guestTokenQueryParam,
            },
          },
        );
      }),
      catchError((err) => {
        const message = `Can't create flow from api call: ${JSON.stringify(err)}`;
        this.router.navigate(['/pay', 'static-finish', 'fail'], {
          queryParams: { message },
        });
        this.loaderService.loaderGlobal = false;

        return EMPTY;
      }),
    ).subscribe();
  }
}
