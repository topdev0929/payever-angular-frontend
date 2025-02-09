import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Select, Store } from '@ngxs/store';
import { merge, Observable, Subject, zip } from 'rxjs';
import {
  filter,
  map,
  scan,
  shareReplay,
  skip,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import {
  HEADER_WITH_PADDING_HEIGHT,
  PANEL_HEIGHT,
} from '@pe/checkout/core';
import { NodeFlowService } from '@pe/checkout/node-api';
import { PluginEventsService } from '@pe/checkout/plugins';
import {
  CloseStep,
  FlowState,
  OpenStep,
  ParamsState,
  StepsState,
} from '@pe/checkout/store';
import {
  AccordionPanelInterface,
  CheckoutStateParamsInterface,
  FlowInterface,
  SectionType,
} from '@pe/checkout/types';
import { PANEL_TRANSLATIONS, PaymentHelperService } from '@pe/checkout/utils';
import { WindowSizesService } from '@pe/checkout/window';

import { SELECTOR_TYPES } from '../selector-show/selector-config';

interface AccordionPanelViewInterface extends AccordionPanelInterface {
  title: string;
  descriptionForDisabled: string;
  isHeaderForceHidden?: boolean;
  showPanelDescriptionForDisabled?: boolean;
  showPanelDescriptionComponent?: boolean;
  showHeader?: boolean;
  showDescription?: boolean;
  descriptionSelector: string;
}

interface TogglePanelPayload {
  panel: AccordionPanelViewInterface;
  index: number;
  state: boolean;
}

const DESCRIPTION_COMPONENTS_MAP: { [key: string]: string } = {
  [SectionType.User]: 'checkout-main-user-summary',
  [SectionType.Address]: 'checkout-main-address-summary',
  [SectionType.Shipping]: 'checkout-main-shipping-summary',
  [SectionType.Coupons]: 'checkout-main-coupons-summary',
  [SectionType.ChoosePayment]: 'checkout-main-payment-summary',
  [SectionType.ExpressChoosePayment]: 'checkout-main-payment-summary',
};

interface ViewModel {
  embedFinish: boolean;
  showCancel: boolean;
}

@Component({
  selector: 'layout-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionMainComponent implements OnInit, OnDestroy {

  @Select(StepsState.steps) private steps$!: Observable<AccordionPanelInterface[]>;

  @Select(ParamsState.params) private params$!: Observable<CheckoutStateParamsInterface>;

  @SelectSnapshot(FlowState.flow) flow: FlowInterface;

  @ViewChildren('panelElement', { read: ElementRef }) panelElements: QueryList<ElementRef>;

  @Input() asCustomElement: boolean;

  panels$: Observable<AccordionPanelViewInterface[]>;

  isMobile$ = this.windowService.isMobile$.pipe(
    shareReplay(1),
  );

  vm$: Observable<Partial<ViewModel>>;

  private destroy$ = new Subject<void>();
  private togglePanelSubject$ = new Subject<TogglePanelPayload>();

  constructor(
    private store: Store,
    private paymentHelperService: PaymentHelperService,
    private pluginEventsService: PluginEventsService,
    private windowService: WindowSizesService,
    private nodeFlowService: NodeFlowService,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  ngOnInit(): void {
    this.panels$ = this.steps$.pipe(
      filter(value => !!value),
      map((panels: AccordionPanelInterface[]) => panels
        .reduce((acc, panel) => {
          if (panel.steps.some(step => !Object.keys(SELECTOR_TYPES).includes(step))) {
            return acc;
          }

          return [
            ...acc,
            {
              ...panel,

              showHeader: !this.isHeaderHidden(panel, panels),
              descriptionSelector: !panel.disabled
                && !panel.step
                && DESCRIPTION_COMPONENTS_MAP[panel.name],
              title: PANEL_TRANSLATIONS[`${panel.name}.title`],
              descriptionForDisabled: panel.disabled && PANEL_TRANSLATIONS[`${panel.name}.description`],
            },
          ];
        }, [])
      ),
      shareReplay(1),
    );

    const togglePanel$ = this.togglePanelSubject$.pipe(
      withLatestFrom(this.isMobile$, this.panels$),
      skip(1),
      tap(([{ panel, index, state }, isMobile, panels]) => {
        if (state) {
          const topOffset = HEADER_WITH_PADDING_HEIGHT + index * PANEL_HEIGHT;
          this.pluginEventsService.emitPanelOpened(this.flow.id, topOffset);

          if (panel.name === SectionType.ChoosePayment
            && isMobile
          ) {
            this.scrollToPanelOnMobile(index, panels);
          }
        }
      }),
    );

    const embedFinish$ = this.paymentHelperService.openEmbedFinish$.pipe(
      withLatestFrom(this.params$),
      map(([open, params]) => ({ embedFinish: !!params?.embeddedMode && open })),
    );

    const showCancelInFooter$ = this.params$.pipe(
      map(({ clientMode, forceNoCloseButton, embeddedMode }) => ({ showCancel:
        !clientMode
          && !forceNoCloseButton
          && !!this.flow.apiCall.cancelUrl
            || embeddedMode && window.self !== window.top,
      })),
    );

    this.vm$ = merge(
      embedFinish$,
      showCancelInFooter$,
    ).pipe(
      scan((acc, curr) => ({ ...acc, ...curr })),
    );


    // We allow to edit total but reset back to choose-pament step
    // But not for edit mode!
    let initialRunForTotal = true;
    const flowTotalReset$ = zip(
      this.params$,
      this.panels$,
    ).pipe(
      tap(([{ editMode }, panels]) => {
        if (!initialRunForTotal
          && this.getActivePanel(panels)?.name === SectionType.Payment
          && !editMode
        ) {
          this.store.dispatch(new OpenStep(SectionType.ChoosePayment));
        }
        initialRunForTotal = false;
      }),
    );

    merge(
      togglePanel$,
      flowTotalReset$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public togglePannel(panel: AccordionPanelViewInterface, state: boolean): void {
    const action = state ? new OpenStep(panel) : new CloseStep(panel);

    this.store.dispatch(action);
  }

  public trackPanel(index: number, panel: AccordionPanelViewInterface): string {
    return panel.step;
  }

  private isHeaderHidden(panel: AccordionPanelInterface, panels: AccordionPanelInterface[]): boolean {
    return this.flow.channel !== 'link'
      && panel.name === SectionType.ChoosePayment
      && this.flow.paymentOptions?.length === 1
      && panels
          .filter(p => p.name !== panel.name)
          .every(p => p.hiddenByState)
      || panel.name === SectionType.Payment
      || panel.name === SectionType.ChoosePayment && panels.find(p => p.step)?.name === SectionType.Payment
      || this.flow.channel !== 'link' && panels.every(p =>
          [SectionType.ChoosePayment, SectionType.Payment].includes(p.name));
  }

  private scrollToPanelOnMobile(index: number, panels: AccordionPanelViewInterface[]): void {
    const indexWithoutHiddenPanels = index - panels.filter(p => p.hiddenByState).length;
    const panelElement = this.panelElements.toArray()[indexWithoutHiddenPanels];

    panelElement?.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }


  private getActivePanel(panels: AccordionPanelViewInterface[]): AccordionPanelViewInterface {
    return panels.find(panel => panel.name);
  }
}
