import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, Subscription } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { AbstractFlowIdComponent, CallbackFunc, SaveProgressHelperService } from '@pe/checkout/core';
import { PluginEventsService } from '@pe/checkout/plugins';
import { FlowStorage, PayByLinkApiService, SendToDeviceStorage } from '@pe/checkout/storage';
import { FlowState, GetFlow, GetSettings, OpenStep, SetParams } from '@pe/checkout/store';
import {
  CheckoutStateParamsInterface,
  FlowInterface,
  SectionType,
  TimestampEvent,
} from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-wrapper',
  templateUrl: 'checkout-wrapper.component.html',
})
export class CheckoutWrapperComponent extends AbstractFlowIdComponent implements OnChanges, OnInit {

  @Input() set updateSteps$(emitter: EventEmitter<void>) {
    if (this.updateStepsSub) { this.updateStepsSub.unsubscribe() }
    this.updateStepsSub = emitter.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.store.dispatch(new SetParams(this.lastParams));
    });
  }

  @Input() set openOrderStep$(emitter: EventEmitter<void>) {
    if (this.openOrderStepSub) { this.openOrderStepSub.unsubscribe() }
    this.openOrderStepSub = emitter.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.store.dispatch(new OpenStep(SectionType.Order));
    });
  }

  @Input() set updateFlow$(emitter: EventEmitter<void>) {
    if (this.updateFlowSub) { this.updateFlowSub.unsubscribe() }
    this.updateFlowSub = emitter.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.store.dispatch(new GetFlow(this.flowId));
    });
  }

  @Input() set updateSettings$(emitter: BehaviorSubject<TimestampEvent>) {
    if (this.updateSettingsSub) { this.updateSettingsSub.unsubscribe() }
    this.updateSettingsSub = emitter.pipe(
      filter(e => !!e),
      tap(() => {
        const { channelSetId } = this.store.selectSnapshot(FlowState.flow);
        this.store.dispatch(new GetSettings(channelSetId, GetSettings.bypassCache));
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  @Input() set saveFlowToStorage$(emitter: EventEmitter<string>) {
    if (this.saveFlowToStorageSub) { this.saveFlowToStorageSub.unsubscribe() }
    this.saveFlowToStorageSub = emitter.pipe(
      switchMap(paymentLinkId => paymentLinkId
        ? this.patchPaymentLinkById(paymentLinkId)
        : this.saveFlowToStorageAndCreateLink()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  @Input('disableLocaleDetection') set setDisableLocaleDetection(disable: boolean) {
    (window as any).pe_checkout_wrapper_locale_change = disable;
  }

  @Input() set params(value: CheckoutStateParamsInterface) {
    const flowId = this.store.selectSnapshot(FlowState.flowId);
    const lsParams = this.flowStorage.getData(flowId, 'params', {});

    this.store.dispatch(new SetParams({ ...lsParams, ...value }));
  }

  @Input() fixedPosition = false;
  @Input() hidden = false;
  @Input() asCustomElement = false;
  @Output('flowcloned') flowCloned: EventEmitter<{ cloned: FlowInterface }> = new EventEmitter();
  @Output('layoutshown') layoutShown: EventEmitter<void> = new EventEmitter();

  public showLayout$: Observable<boolean>;

  private updateStepsSub: Subscription = null;
  private openOrderStepSub: Subscription = null;
  private updateFlowSub: Subscription = null;
  private updateSettingsSub: Subscription = null;
  private saveFlowToStorageSub: Subscription = null;
  private lastParams: CheckoutStateParamsInterface = null;

  private env = this.injector.get(PE_ENV);
  private sendToDeviceStorage = this.injector.get(SendToDeviceStorage);
  private payByLinkApiService = this.injector.get(PayByLinkApiService);

  private flowStorage = this.injector.get(FlowStorage);
  private pluginEventsService = this.injector.get(PluginEventsService);
  private saveProgressHelperService = this.injector.get(SaveProgressHelperService);
  private localeConstantsService = this.injector.get(LocaleConstantsService);

  initFlow(): void {
    super.initFlow();
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.showLayout$ = this.flow$.pipe(
      map(f => f.currency),
      distinctUntilChanged(),
      switchMap(c => this.localeConstantsService.registerLocaleForCurrency$(c)),
      mapTo(true),
    );

    this.cdr.markForCheck();
  }

  saveFlowToStorageAndCreateLink() {
    const flowId = this.flowId;

    return this.doSaveFlowToStorageAndCreateLink().pipe(
      tap((link) => {
        this.pluginEventsService.emitFlowSavedToStorage(flowId, link);
      }),
      catchError((err) => {
        this.pluginEventsService.emitSnackBarToggle(true, err);
        this.pluginEventsService.emitFlowSavedToStorage(flowId, null);

        return EMPTY;
      })
    );
  }

  private patchPaymentLinkById(id: string) {
    const onError = (err: string) => {
      this.pluginEventsService.emitSnackBarToggle(true, err);
      this.pluginEventsService.emitFlowSavedToStorage(this.flowId, null);
    };

    return new Observable<Parameters<CallbackFunc>[0]>((obs) => {
      this.saveProgressHelperService.triggerSaving(this.flowId, (data) => {
        obs.next(data);
      });
    }).pipe(
      switchMap((data) => {
        if (data === false) {
          onError('Invalid data!');

          return EMPTY;
        }
        if (!data.flow.amount) {
          onError('Please save amount in order to get link');
        }

        return this.payByLinkApiService.prepareDataAndPatchLink(id, data.flow).pipe(
          take(1),
          tap(() => {
            this.pluginEventsService.emitFlowSavedToStorage(this.flowId, 'ok');
          }),
          catchError((err) => {
            onError('Not possible to save link!');

            return err;
          }),
        );
      })
    );
  }

  doSaveFlowToStorageAndCreateLink(): Observable<string> {
    return new Observable<string>((obs) => {
      // TODO Maybe has sense to move that logic to other place
      this.settings$.pipe(
        takeUntil(this.destroy$),
      ).subscribe((settings) => {
        this.saveProgressHelperService.triggerSaving(this.flowId, (data) => {
          if (data === false) {
            obs.error('Invalid data!');

            return;
          }
          const flow = data.flow;
          if (!flow.amount) {
            obs.error($localize `:@@amount.errors.amount:`);

            return;
          }
          this.sendToDeviceStorage.prapareAndSaveData({
            flow,
            storage: this.flowStorage.getDump(flow.id),
            generate_payment_code: settings.channelType === 'pos',
            // phone_number: this.form.get('phoneTo').value || '',
            // source: this.form.get('phoneTo').value ? 'sms' : 'email',
            force_no_order: true,
            force_no_header: false,
            force_payment_only: false,
            force_choose_payment_only_and_submit: false,
            open_next_step_on_init: data.openNextStep,
            // cancel_button_text: null
          }).pipe(
            map(code => `${this.env.frontend.checkoutWrapper}/${this.localeConstantsService.getLang()}/pay/restore-flow-from-code/${code}?channelSetId=${flow.channelSetId}`),
            tap((restoreLink: string) => {
              obs.next(restoreLink);
            }, () => {
              obs.error('Not possible to save link!');
            }),
          ).subscribe();
        });
      });
    });
  }
}
