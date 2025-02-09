import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Select } from '@ngxs/store';
import { Observable, combineLatest, merge } from 'rxjs';
import { map, scan, shareReplay, withLatestFrom } from 'rxjs/operators';

import { PaymentProcessingStatusService } from '@pe/checkout/api';
import { MediaApiService } from '@pe/checkout/api/media';
import { FlowStorage } from '@pe/checkout/storage';
import { FlowState, ParamsState, SettingsState, StepsState } from '@pe/checkout/store';
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

import { HeaderSettings } from '../../models';
import { LayoutService } from '../../services';

interface ViewModel {
  settings: HeaderSettings;
  showOrder: boolean;
}

@Component({
  selector: 'order-header',
  templateUrl: './order-header.component.html',
  styleUrls: ['./order-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderHeaderComponent implements OnInit {

  @SelectSnapshot(FlowState.flow) public flow!: FlowInterface;

  @Select(ParamsState.params) public params$!: Observable<CheckoutStateParamsInterface>;

  @Select(StepsState.steps) private steps$: Observable<AccordionPanelInterface[]>;

  @Select(SettingsState.settings) private settings$!: Observable<CheckoutSettingsInterface>;

  @Input() asCustomElement: boolean;

  public vm$: Observable<Partial<ViewModel>>;

  public readonly isPos = this.paymentHelperService.isPos(this.flow);

  public readonly isInIframe = this.isIframeOrCustomElement();

  constructor(
    private windowService: WindowSizesService,
    private windowStylesService: WindowStylesService,
    private paymentHelperService: PaymentHelperService,
    private mediaApiService: MediaApiService,
    private flowStorage: FlowStorage,
    private paymentProcessingStatusService: PaymentProcessingStatusService,
    private layoutService: LayoutService,
  ) {}

  ngOnInit(): void {
    const headerSettings$ = combineLatest([
      this.settings$,
      this.params$,
    ]).pipe(
      withLatestFrom(this.windowService.windowSizeInfo$),
      map(([
        [{ logo, styles }, { forceSinglePaymentMethodOnly, clientMode, merchantMode, forceNoPaddings }],
        windowSizeInfo,
      ]) => {
        const paymentCode = this.flowStorage.getData(this.flow.id, 'paymentSource', {});
        const enablePosBusinessHeader = (!this.paymentHelperService.isPos(this.flow)
          || !!forceSinglePaymentMethodOnly)
          || paymentCode.source === 'qr';

        return {
          stylesActive: styles?.active
            && (!clientMode
              && !merchantMode
              && enablePosBusinessHeader
            ),
          ...(logo && {
            logo: {
              url: this.mediaApiService.getMediaUrl(logo, 'images'),
              alignment: this.windowStylesService.businessLogoAlignment(windowSizeInfo, styles),
            },
          }),
          fullWidth: (styles?.active
            && !!logo
            && (!clientMode
              && !merchantMode
              && !this.paymentHelperService.isPos(this.flow)
              && enablePosBusinessHeader
            )) || forceNoPaddings,
        };
      }),
      shareReplay(1),
    );

    const flags$ = combineLatest([
      this.paymentProcessingStatusService.locked$,
      this.layoutService.showOrder$,
      this.steps$,
    ]).pipe(
      map(([lockedByPayment, showOrder, steps]) => ({
        showOrder: this.showOrder(lockedByPayment, showOrder, steps),
      }))
    );

    this.vm$ = merge(
      headerSettings$.pipe(
        map(settings => ({
          settings,
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
    } catch (e) {}

    return inIframe || this.asCustomElement;
  }
}
