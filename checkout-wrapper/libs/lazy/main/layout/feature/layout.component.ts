import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from '@angular/core';
import {
  merge,
  Observable,
  of,
  Subscription,
  timer,
} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  take,
  takeUntil,
  repeat,
  tap,
  mergeMap,
  first,
  scan,
} from 'rxjs/operators';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { AbstractFlowIdComponent } from '@pe/checkout/core';
import { PluginEventsService } from '@pe/checkout/plugins';
import { SendToDeviceStorage } from '@pe/checkout/storage';
import { CheckoutSettingsInterface } from '@pe/checkout/types';
import { CustomElementService, DEFAULT_HEADER_HEIGHT } from '@pe/checkout/utils';

import { LayoutType } from '../enums';
import { LayoutService } from '../services';

interface ViewModel {
  forceFullScreen: boolean;
  forceNoScroll: boolean;
  forceNoSnackBarNotifications: boolean;
  layoutWithPaddings: boolean;
  gridCssClass: string;
  showOrder: boolean;
  layoutType: LayoutType;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-layout',
  styleUrls: ['./layout.component.scss'],
  templateUrl: 'layout.component.html',
})
export class LayoutComponent extends AbstractFlowIdComponent implements AfterViewChecked, AfterViewInit {
  protected customElementService = this.injector.get(CustomElementService);
  private pluginEventsService = this.injector.get(PluginEventsService);
  private sendToDeviceStorage = this.injector.get(SendToDeviceStorage);
  private layoutService = this.injector.get(LayoutService);

  @ViewChild('mainContent', { static: false }) mainContentElRef: ElementRef;
  @ViewChild('orderContainer', { read: ViewContainerRef }) orderContainerRef: ViewContainerRef;
  @ViewChildren('panelElement', { read: ElementRef }) panelElements: QueryList<ElementRef>;

  @Input() fixedPosition = false;
  @Input() hidden = false;
  @Input() asCustomElement = false;
  @Input() settings: CheckoutSettingsInterface;

  @Output() layoutShown: EventEmitter<void> = new EventEmitter();

  public vm$: Observable<Partial<ViewModel>>;
  private showDefaultHeader$: Observable<boolean>;

  footerTranslates = {
    payeverHref: $localize `:@@layout.footer.links.payever_href:`,
    copyrightHref: $localize `:@@layout.footer.links.copyright_href:`,
    imprintHref: $localize `:@@layout.footer.links.imprint_href:`,
    agreementHref: $localize `:@@layout.footer.links.agreement_href:`,
    protectionHref: $localize `:@@layout.footer.links.protection_href:`,
  };

  readonly defaultBusinessHeaderHeight = DEFAULT_HEADER_HEIGHT;
  private emitHeightSubscribtions: Subscription[] = [];

  constructor(
    protected injector: Injector,
    private analyticsFormService: AnalyticsFormService,
  ) {
    super(injector);
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons([
      'arrow-left-ios-16',
      'arrow-down-small-16',
      'warning-20',
      'payever-checkout-logo',
    ], null, this.customElementService.shadowRoot);
  }

  ngAfterViewChecked(): void {
    this.emitHeightSubscribtions.forEach((sub) => {
      sub.unsubscribe();
    });
    // Have to send multiple times because of animation
    this.emitHeightSubscribtions = [
      timer(1).pipe(
        mergeMap(() => this.emitHeight()),
        takeUntil(this.destroy$),
      ).subscribe(),
      timer(200).pipe(
        mergeMap(() => this.emitHeight()),
        takeUntil(this.destroy$),
      ).subscribe(),
      timer(500).pipe(
        mergeMap(() => this.emitHeight()),
        takeUntil(this.destroy$),
      ).subscribe(),
    ];
  }

  ngAfterViewInit(): void {
    // Reset to be able restore Flow again when click history back in browser
    this.sendToDeviceStorage.setIgnoreGetData(false);
    this.analyticsFormService.emitEventFormInit();

    this.layoutShown.emit();
  }

  initFlow(): void {
    super.initFlow();

    this.pluginEventsService.emitLoaded(this.flowId);

    this.showDefaultHeader$ = this.params$.pipe(
      distinctUntilChanged(),
      map(({ forceNoHeader, merchantMode, clientMode }) =>
        ((!forceNoHeader && (merchantMode || clientMode)) || !this.settings?.styles?.active)),
    );

    // Just checking height for sure every second (important for Instant payment and PayEx)
    const heightEmitter$ = timer(1000).pipe(
      mergeMap(() => this.emitHeight()),
      takeUntil(this.destroy$),
      repeat(),
    );

    const initAnalyticForm$ = this.flow$.pipe(
      map((d) => {
        this.analyticsFormService.initAnalyticForm(d.id, d.businessId);

        return d.total;
      }),
      distinctUntilChanged()
    );


    merge(
      heightEmitter$,
      initAnalyticForm$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();

    const params$ = this.params$.pipe(
      map(({
        forceFullScreen,
        forceNoPaddings,
        forceNoSnackBarNotifications,
        forceNoScroll,
        layoutWithPaddings,
      }) => ({
        forceFullScreen,
        forceNoScroll,
        forceNoSnackBarNotifications,
        layoutWithPaddings,
        gridCssClass: forceNoPaddings
          ? 'col-xs-12'
          : 'col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3',
      })),
    );

    const showOrder$ = this.layoutService.showOrder$.pipe(
      map(showOrder => ({
        showOrder,
        layoutType: showOrder ? LayoutType.Order : LayoutType.Accordion,
      })),
    );

    this.vm$ = merge(
      params$,
      showOrder$,
    ).pipe(
      scan((acc, curr) => ({ ...acc, ...curr })),
    );
  }

  orderSaved(): void {
    this.layoutService.toggleShowOrder(false);
    this.cdr.markForCheck();
  }

  private emitHeight(): Observable<any> {
    if (!this.showDefaultHeader$) { return of(null) }

    return this.showDefaultHeader$.pipe(
      take(1),
      mergeMap(showHeader => this.settings$.pipe(
        mergeMap(settings => this.flow$.pipe(
          first(),
          filter(d => !!d),
          tap((flow) => {
            const vgrid = 11; // parseFloat(peVariables['pe_vgrid_height'] as string);
            const header: number = showHeader ? 5 * vgrid : 0;
            const paddings: number = 2 * vgrid;
            const caution: number = settings?.testingMode ? 5 * vgrid : 0;
            const extra = 40; // TODO Required at some pages (/choose-payment). Need to research why.
            const offset = paddings + header + caution + extra;

            if (this.mainContentElRef?.nativeElement) {
              const emitHeight = parseFloat(this.mainContentElRef.nativeElement.offsetHeight) + offset;
              this.pluginEventsService.emitHeight(flow.id, emitHeight);
            }
          }),
        )),
      )),
    );
  }
}
