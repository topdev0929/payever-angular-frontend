import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { EMPTY } from 'rxjs';
import { catchError, map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

import { LoaderService } from '@pe/checkout/core/loader';
import { FlowStorage, SendToDeviceStorage } from '@pe/checkout/storage';
import { AuthSelectors, CreateFlow, FlowState, SetSteps } from '@pe/checkout/store';
import { camelCase } from '@pe/checkout/utils/camelcase';

@Component({
  selector: 'restore-flow-from-code',
  template: '',
})
export class RestoreFlowFromCodeComponent implements OnInit {

  private activatedRoute = inject(ActivatedRoute);
  private flowStorage = inject(FlowStorage);
  private loaderService = inject(LoaderService);
  private sendToDeviceStorage = inject(SendToDeviceStorage);
  private router = inject(Router);
  private store = inject(Store);

  @SelectSnapshot(AuthSelectors.guestTokenQueryParam)
  private readonly guestTokenQueryParam: Params;

  ngOnInit(): void {
    const restoreCodeId = this.activatedRoute.snapshot.params.code; // Media service restore code
    this.loaderService.loaderGlobal = true;
    this.sendToDeviceStorage.getData(restoreCodeId).pipe(
      map((data) => {
        if (!data) {
          throw new Error('Flow code doesn\'t exists on server!');
        }

        return data;
      }),
      catchError(() => {
        this.loaderService.loaderGlobal = false;
        this.router.navigate(['/pay', restoreCodeId, 'static-finish', 'fail']);

        return EMPTY;
      }),
      switchMap((rawData) => {
        const data = camelCase(rawData);

        return this.store.dispatch(
          new CreateFlow({
            channelSetId: data.flow.channelSetId,
            currency: data.flow.currency,
            amount: data.flow.amount,
            reference: data.flow.reference || null,
            phoneNumber: data.phoneNumber || null,
            source: data.source,
            generatePaymentCode: data.generatePaymentCode,
            paymentCodeId: data.codeId,
            flowRawData: data.flow,
          })
        ).pipe(
          withLatestFrom(this.store.select(FlowState.flow)),
          map(([, flow]) => flow),
          tap((flow) => {
              this.flowStorage.restoreFromDump(flow.id, rawData.storage);
              // To remove at server after success payment
              this.flowStorage.setServerFlowDumpCodeId(flow.id, restoreCodeId);
              this.sendToDeviceStorage.setIgnoreGetData(true); // For optimization
              this.store.dispatch(new SetSteps(this.flowStorage.getData(flow.id, 'steppermanagersteps')));

              this.router.navigate([`/pay/${flow.id}`], {
                queryParams: {
                  openNextStepOnInit: data.openNextStepOnInit,
                  forceNoOrder: coerceBooleanProperty(data.forceNoOrder),
                  forceNoHeader: coerceBooleanProperty(data.forceNoHeader),
                  forceNoSendToDevice: data.forceNoSendToDevice,
                  forcePaymentOnly: coerceBooleanProperty(data.forcePaymentOnly),
                  forceChoosePaymentOnlyAndSubmit: coerceBooleanProperty(data.forceChoosePaymentOnlyAndSubmit),
                  forceHidePreviousSteps: data.forceHidePreviousSteps,
                  forceSinglePaymentMethodOnly: data.forceSinglePaymentMethodOnly,
                  forceHideShareButton: data.forceHideShareButton,
                  forceHideReference: coerceBooleanProperty(data.forceHideReference),
                  forceNoPaddings: false,
                  forceFullScreen: false,
                  layoutWithPaddings: false,
                  forceNoSnackBarNotifications: false,
                  showQRSwitcher: false,
                  forceNoScroll: false,
                  embeddedMode: false,
                  // We suppose that restored flow is always opened
                  //  at customer device so merchant mode is not possible
                  merchantMode: false,
                  clientMode: false,
                  cancelButtonText: '',
                  ...this.guestTokenQueryParam,
                },
              });
            },
          ),
        );
      }),
      take(1),
    ).subscribe();
  }
}
