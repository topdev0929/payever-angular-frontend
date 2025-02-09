import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  inject,
} from '@angular/core';
import { defer, merge, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  exhaustMap,
  filter,
  map,
  retry,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { StorageService } from '@pe/checkout/storage';
import {
  CustomWidgetConfigInterface,
  PaymentItem,
} from '@pe/checkout/types';
import { SnackBarService } from '@pe/checkout/ui/snackbar';
import { fromMutationObserver } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { BANKS, DEFAULT_COLORS } from '../../constants';
import {
  IframeMessage,
  isChooseMessage,
  isRemoveMessage,
  ChooseBankMessage,
} from '../../models';
import { IvyWidgetService } from '../../services';
import { IvyIframeComponent } from '../iframe';

const IVY_BUTTON_SCRIPT = 'https://cdn.getivy.de/button.js';

/**
 * Initiates an Ivy checkout in a popup.
 */
declare function startIvyCheckout(url: string, mode: 'popup'): void;

@Component({
  selector: 'ivy-widget',
  templateUrl: './ivy-widget.component.html',
  styleUrls: ['./ivy-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class IvyWidgetComponent implements OnInit, OnDestroy {
  private storageService = inject(StorageService);

  @Input() amount: number;

  @Input() channelSet: string;

  @Input() config: CustomWidgetConfigInterface;

  @Input() cart: PaymentItem[];

  @Input() isDebugMode: boolean;

  // eslint-disable-next-line
  @Output('clicked') clickedEmitter = new EventEmitter();

  // eslint-disable-next-line
  @Output('failed') failedEmitter = new EventEmitter();

  private readonly listeners: (() => void)[] = [];
  private readonly defaultColors = DEFAULT_COLORS;
  public readonly banks = BANKS;
  private overlayRef: OverlayRef;

  private readonly messageSubject$ = new Subject<IframeMessage>();

  public readonly fetchIvy$ = new Observable<boolean>((subscriber) => {
    const script = this.document.createElement('script');
    script.id = 'ivy-button-script';
    script.src = IVY_BUTTON_SCRIPT;
    script.onload = () => subscriber.next(true);
    script.onerror = () => subscriber.error(false);
    script.async = true;
    this.document.head.appendChild(script);
  });

  public readonly translations = {
    chooseBank: $localize`:@@ivy-finexp-widget.pay:Pay now`,
    chooseBankWith: $localize`:@@ivy-finexp-widget.payWith:Pay now with`,
  };

  public bankSelected: boolean;

  private isUserThemeDark: boolean;

  public get savedBank(): ChooseBankMessage {
    return JSON.parse(this.storageService.get('ivy-bank')) as ChooseBankMessage;
  }

  constructor(
    private readonly renderer: Renderer2,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly ivyService: IvyWidgetService,
    private readonly snackbarService: SnackBarService,
    private readonly overlay: Overlay,
    private readonly destroy$: PeDestroyService,
  ) {
  }

  private readonly chooseBank$ = this.messageSubject$.pipe(
    filter(isChooseMessage),
    tap((data) => {
      this.chooseBank(data);
    }),
    shareReplay(1),
  );

  public readonly buttonConfig$ = this.chooseBank$.pipe(
    startWith(this.savedBank ?? { colors: this.defaultColors, logo: null }),
    filter(data => !!data),
    map(({ colors, logo }) => ({
      styles: {
        backgroundColor: this.isUserThemeDark
          ? colors?.bgDark || this.defaultColors.bgDark
          : colors?.bgLight || this.defaultColors.bgLight,
        color: this.isUserThemeDark
          ? colors?.textDark || this.defaultColors.textDark
          : colors?.textLight || this.defaultColors.textLight,
      } as CSSStyleDeclaration,
      logo,
    })),
  );

  public readonly settings$ = defer(() => this.ivyService.getSettings(this.channelSet)).pipe(
    retry(3),
    shareReplay(1),
  );

  private readonly startSubject$ = new Subject<void>();
  private readonly start$ = this.startSubject$.pipe(
    filter(() => !this.isDebugMode),
    exhaustMap(() => this.ivyService.createFlow({
      channelSetId: this.channelSet,
      amount: this.amount,
      cart: this.cart,
      deliveryFee: this.config.shippingOption?.price ?? 0,
      noticeUrl: this.config.noticeUrl,
      cancelUrl: this.config.cancelUrl,
      failureUrl: window.location.href,
      successUrl: this.config.successUrl,
      pendingUrl: this.config.pendingUrl,
    }).pipe(
      exhaustMap(flow => this.ivyService.getConnection(this.channelSet).pipe(
        withLatestFrom(this.settings$),
        switchMap(([{ _id }, settings]) => this.ivyService.submitPayment(
          flow,
          _id,
          this.amount,
          this.channelSet,
          settings,
          this.config,
          this.cart,
        ).pipe(
          tap(response => startIvyCheckout(response.paymentDetails.redirectUrl, 'popup')),
        )),
      )),
      catchError((error) => {
        const content = Array.isArray(error?.error?.message)
          ? error?.error?.error
          : error?.error?.message
          || error?.message
          || error?.error
          || error?.errors?.[0]?.message
          || $localize`:@@ivy-finexp-widget.unknownError:`;

        this.snackbarService.toggle(true, content, {
          duration: 5000,
        });

        return of(false);
      }),
    )),
    shareReplay(1),
  );

  public readonly loading$ = merge(
    this.startSubject$.pipe(
      filter(() => !this.isDebugMode),
      map(() => true),
    ),
    this.start$.pipe(
      filter(value => value === false),
    ),
    defer(() => fromMutationObserver(
      this.document.body,
      { childList: true, subtree: true },
    ).pipe(
      map(() => false),
    )),
  );

  ngOnInit(): void {
    this.listeners.push(
      this.renderer.listen(
        window,
        'message',
        (message: MessageEvent<IframeMessage>) => {
          this.messageSubject$.next(message.data);
        },
      ),
    );

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener(
        'change',
        (event) => {
          this.isUserThemeDark = event.matches;
        },
      );

    const removeBank = this.messageSubject$.pipe(
      filter(isRemoveMessage),
      tap(() => {
        this.removeBank();
      }),
    );

    merge(
      removeBank,
      this.start$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.listeners.forEach(listener => listener());
  }

  public startIvy(): void {
    this.startSubject$.next();
  }

  public openBankSelection(element: HTMLDivElement): void {
    this.overlayRef = this.overlay.create({
      backdropClass: 'ivy-iframe-backdrop',
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(element)
        .withPositions([
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'bottom',

          },
        ])
        .withDefaultOffsetY(-10),
      disposeOnNavigation: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
    });

    this.overlayRef.attach(new ComponentPortal(IvyIframeComponent));
    this.overlayRef.backdropClick().pipe(
      tap(() => this.overlayRef.dispose()),
    ).subscribe();
  }

  private chooseBank(data: ChooseBankMessage): void {
    data.consent && this.storageService.set('ivy-bank', JSON.stringify(data));
    this.bankSelected = true;
    this.overlayRef?.dispose();
  }

  private removeBank(): void {
    this.storageService.remove('ivy-bank');
  }
}
