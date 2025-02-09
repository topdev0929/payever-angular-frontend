import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Select, Store } from '@ngxs/store';
import { combineLatest, merge, Observable } from 'rxjs';
import { map, scan, shareReplay, withLatestFrom } from 'rxjs/operators';

import {
  PaymentProcessingStatusService,
} from '@pe/checkout/api';
import { MediaApiService } from '@pe/checkout/api/media';
import { FlowStorage } from '@pe/checkout/storage';
import {
  CheckoutState,
  FlowState,
  ParamsState,
  SettingsState,
  StepsState,
} from '@pe/checkout/store';
import {
  AccordionPanelInterface,
  CheckoutStateParamsInterface,
  FlowInterface,
  CheckoutSettingsInterface,
  FlowStateEnum,
  SectionType,
} from '@pe/checkout/types';
import { PaymentHelperService } from '@pe/checkout/utils';
import { WindowSizesService, WindowStylesService } from '@pe/checkout/window';

import { HeaderSettings } from '../../../models';
import { LayoutService } from '../../../services';

type ViewModel = {
  settings: HeaderSettings;
  cancelButtonText: string;
  lockedUi: boolean;
  lockedByPayment: boolean;
  showCancel: boolean;
  showCustomLogo: boolean;
  showOrder: boolean;
  showShareBag: boolean;
  showOrderAmount: boolean;
}

@Component({
  selector: 'layout-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionHeaderComponent implements OnInit {

  @SelectSnapshot(FlowState.flow) public flow!: FlowInterface;

  @Select(ParamsState.params) public params$!: Observable<CheckoutStateParamsInterface>;

  @Select(StepsState.steps) private steps$: Observable<AccordionPanelInterface[]>;

  @Select(SettingsState.settings) private settings$!: Observable<CheckoutSettingsInterface>;

  @Select(CheckoutState.lockedUi) private lockedUi$!: Observable<boolean>;

  @Input() asCustomElement: boolean;

  public vm$: Observable<Partial<ViewModel>>;

  public readonly isPos = this.paymentHelperService.isPos(this.flow);

  public readonly isInIframe = this.isIframeOrCustomElement();

  public readonly showCancel$ = combineLatest([
    this.params$.pipe(
      map(({ clientMode }) => clientMode)
    ),
    this.lockedUi$.pipe(
      map(lockedUi => !lockedUi),
    ),
  ]).pipe(
    map(([showCancel, unlockedUi]) => showCancel && unlockedUi),
  );

  constructor(
    private store: Store,
    private windowService: WindowSizesService,
    private windowStylesService: WindowStylesService,
    private paymentHelperService: PaymentHelperService,
    private mediaApiService: MediaApiService,
    private flowStorage: FlowStorage,
    private paymentProcessingStatusService: PaymentProcessingStatusService,
    private layoutService: LayoutService,
  ) { }

  ngOnInit(): void {
    // list to window resize event to update header height
    const paymentCode = this.flowStorage.getData(this.flow.id, 'paymentSource', {});
    const headerSettings$ = combineLatest([
      this.settings$,
      this.params$,
    ]).pipe(
      withLatestFrom(this.windowService.windowSizeInfo$),
      map(([
        [{ logo, styles }, { forceSinglePaymentMethodOnly, clientMode, merchantMode, forceNoPaddings }],
        windowSizeInfo,
      ]) => {
        const enablePosBusinessHeader = (!merchantMode
          || !!forceSinglePaymentMethodOnly)
          || paymentCode.source === 'qr'
          || this.paymentHelperService.isPos(this.flow);

        return {
          stylesActive: styles?.active
            && (!clientMode
              && !merchantMode
              && enablePosBusinessHeader
            ),
          logo: {
            url: logo && this.mediaApiService.getMediaUrl(logo, 'images'),
            alignment: this.windowStylesService.businessLogoAlignment(windowSizeInfo, styles),
          },
          fullWidth: (styles?.active
            && !!logo
            && (!clientMode
              && !merchantMode
              && enablePosBusinessHeader
            )) || forceNoPaddings,
        };
      }),
      shareReplay(1),
    );

    const flags$ = merge(
      this.params$.pipe(
        map(params => ({
          showCancel: params.merchantMode,
          showShareBag: !params.forceHideShareButton
            && this.paymentHelperService.isPos(this.flow)
            && paymentCode.source !== 'qr',
          cancelButtonText: params.cancelButtonText || $localize`:@@action.cancel:`,
          showOrderAmount: params.showOrderAmount,
        })),
      ),
      this.store.select(CheckoutState.lockedUi).pipe(
        map(lockedUi => ({ lockedUi })),
      ),
      combineLatest([
        this.paymentProcessingStatusService.locked$,
        this.layoutService.showOrder$,
        this.steps$,
      ]).pipe(
        map(([lockedByPayment, showOrder, steps]) => ({
          lockedByPayment,
          showOrder: this.showOrder(lockedByPayment, showOrder, steps),
        }))
      ),
    );

    this.vm$ = merge(
      headerSettings$.pipe(
        map(settings => ({
          settings,
          showCustomLogo: settings.stylesActive && !!settings.logo,
        })),
      ),
      flags$,
    ).pipe(
      scan((acc, curr) => ({ ...acc, ...curr })),
    );
  }

  toggleOrderEdit(value?: boolean): void {
    this.layoutService.toggleShowOrder(value);
  }

  private showOrder(
    lockedByPayment: boolean,
    showOrder: boolean,
    steps: AccordionPanelInterface[],
  ): boolean {
    return this.flow.total
      && this.flow.currency
      && this.flow.state !== FlowStateEnum.FINISH
      && !lockedByPayment
      && showOrder
      && !!steps.find(step => step.name === SectionType.Order
        && !step.hidden
        && !step.hiddenByState);
  }

  private isIframeOrCustomElement(): boolean {
    let inIframe = true;
    try {
      inIframe = window.self !== window.top;
    } catch (e) { }

    return inIframe || this.asCustomElement;
  }
}
