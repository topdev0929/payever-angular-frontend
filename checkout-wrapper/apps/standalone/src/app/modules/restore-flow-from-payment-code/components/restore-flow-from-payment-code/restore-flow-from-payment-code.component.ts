import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { throwError } from 'rxjs';
import { catchError, map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

import { ApiService } from '@pe/checkout/api';
import { LoaderService } from '@pe/checkout/core/loader';
import { SendToDeviceStorage } from '@pe/checkout/storage';
import { AuthSelectors, CreateFlow, FlowState } from '@pe/checkout/store';
import { PaymentExternalCodeInterface } from '@pe/checkout/types';
import { camelCase } from '@pe/checkout/utils/camelcase';

@Component({
  selector: 'restore-flow-from-payment-code',
  template: '',
})
export class RestoreFlowFromPaymentCodeComponent implements OnInit {

  @SelectSnapshot(AuthSelectors.guestTokenQueryParam)
  private readonly guestTokenQueryParam: Params;

  private activatedRoute: ActivatedRoute = this.injector.get(ActivatedRoute);
  private apiService: ApiService = this.injector.get(ApiService);
  private loaderService: LoaderService = this.injector.get(LoaderService);
  private sendToDeviceStorage: SendToDeviceStorage = this.injector.get(SendToDeviceStorage);
  private router: Router = this.injector.get(Router);
  private store = this.injector.get(Store);

  constructor(private injector: Injector) {
  }

  ngOnInit(): void {
    const restoreCodeId = this.activatedRoute.snapshot.params.code; // Media service restore code
    this.loaderService.loaderGlobal = true;
    this.apiService.getPaymentExternalCodeById(restoreCodeId).pipe(
      map((data) => {
        if (!data) {
          this.router.navigate(['/pay', restoreCodeId, 'static-finish', 'fail']);
        }

        return data;
      }),
      catchError((err) => {
        this.loaderService.loaderGlobal = false;
        this.router.navigate(['/pay', restoreCodeId, 'static-finish', 'fail']);

        return throwError(err);
      }),
      switchMap((rawData: PaymentExternalCodeInterface) => {
        const data = camelCase(rawData);
        const forceNoOrder = !!data.flow.amount && !!data.flow.reference;

        return this.store.dispatch(new CreateFlow({
          channelSetId: data.flow.channelSetId,
          currency: data.flow.currency,
          amount: data.flow.amount,
          reference: data.flow.reference || null,
          phoneNumber: data.flow.billingAddress?.phone
            ? data.flow.billingAddress?.phone
            : null,
          paymentCodeId: rawData._id,
          flowRawData: data.flow,
        })).pipe(
          withLatestFrom(this.store.select(FlowState.flow)),
          map(([, flow]) => flow),
          tap((flow) => {
            this.sendToDeviceStorage.setIgnoreGetData(true); // For optimization
            this.router.navigate([`/pay/${flow.id}`], {
              queryParams: {
                forceNoOrder,
                forceNoSendToDevice: true,
                forceNoPaddings: false,
                forceNoHeader: false,
                forceFullScreen: false,
                layoutWithPaddings: false,
                forceNoSnackBarNotifications: false,
                showQRSwitcher: false,
                forceNoScroll: false,
                ...this.guestTokenQueryParam,
              },
            });
          }),
        );
      }),
      take(1),
    ).subscribe();
  }
}
