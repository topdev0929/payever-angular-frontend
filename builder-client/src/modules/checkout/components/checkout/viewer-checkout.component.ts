import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { isNumber } from 'lodash-es';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { filter, shareReplay, startWith, takeUntil, tap } from 'rxjs/operators';

import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { MessageBusService } from '@pe/ng-kit/modules/micro';
import { EnvService } from '../../../client/services/env.service';
import { FlowBodyCartInterface } from '../../interfaces';
import { NewCartService } from '../../services/cart.service';
import { NewCheckoutService } from '../../services/checkout.service';

@Component({
  selector: 'pe-builder-checkout',
  templateUrl: 'viewer-checkout.component.html',
  styleUrls: ['viewer-checkout.component.scss'],
  // tslint:disable-next-line:use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
})
export class ViewerCheckoutComponent extends AbstractComponent implements OnInit, OnDestroy, OnChanges {

  @Input() set hidden(value: boolean) {
    this.hiddenSubject$.next(value);
  }
  get hidden(): boolean {
    return this.hiddenSubject$.getValue();
  }

  @Input() mode: 'cart' | 'amount' = 'cart' ;

  private flowId$: BehaviorSubject<string>;
  private hiddenSubject$ = new BehaviorSubject<boolean>(true);

  private allowClose = false;
  private clearCardOnClose = false;

  private hiddenValue = true;
  private iframeWrapWrap: HTMLDivElement;
  private iframeWrap: HTMLDivElement;
  private iframe: HTMLIFrameElement;
  private _checkoutFlowMicroUrl: string;

  private flowId: string;

  constructor(
    private cartService: NewCartService,
    private chRef: ChangeDetectorRef,
    private checkoutService: NewCheckoutService,
    private envService: EnvService,
    private messageBusService: MessageBusService,
    private router: Router,
    // private settingsService: SettingsService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
  ) {
    super();
    this.messageHandler = this.messageHandler.bind(this);
  }

  get checkoutFlowMicroUrl(): string {
    return this._checkoutFlowMicroUrl;
  }

  set checkoutFlowMicroUrl(url: string) {
    this.createIframeHtml();
    this.iframe.setAttribute('src', url);
    this._checkoutFlowMicroUrl = url;
  }

  ngOnInit(): void {
    this.flowId$ = this.mode === 'cart'
      ? this.checkoutService.cartFlowId$
      : this.checkoutService.typeAmountFlowId$;

    this.flowId$
      .pipe(
        takeUntil(this.destroyed$),
        filter(d => !!d),
        tap((flowId: string) => {
          this.flowId = flowId;
          if (this.hidden) {
            // On 'payeverCheckoutAfterFlowClone' we don't reset url
            this.checkoutFlowMicroUrl = null;
            this.openCheckout();
          }
        }),
      )
      .subscribe();

    window.addEventListener('message', this.messageHandler, false);
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageHandler);
    this.destroyIframeHtml();
    super.ngOnDestroy();
    window.removeEventListener('message', this.messageHandler);
  }

  ngOnChanges(): void {
    if (this.iframeWrapWrap && this.iframeWrapWrap.style) {
      this.iframeWrapWrap.style.top = this.hidden ? '-20000px' : '0px';
    }
  }

  private messageHandler(data: any): void {
    if (!this.iframe || !this.iframe.contentWindow) {
      return;
    }

    if (data.data === 'custom-amount-enabled') {
      this.iframe.contentWindow.postMessage({ event: 'payeverCheckoutDoUpdateFlowAndResetStep' }, '*');
      this.iframe.contentWindow.postMessage(
        {
          event: 'payeverCheckoutDoForceUseCard',
          value: { forceUseCard: false },
        },
        '*',
      );
    }
    if (data.data === 'items-added-to-cart') {
      //  && this.settings && this.settings.isCart) {
      this.iframe.contentWindow.postMessage({ event: 'payeverCheckoutDoUpdateFlowAndResetStep' }, '*');
      this.iframe.contentWindow.postMessage(
        {
          event: 'payeverCheckoutDoForceUseCard',
          value: { forceUseCard: true },
        },
        '*',
      );
    }
  }

  private initCheckoutMicro(): void {
    this.allowClose = false;
    setTimeout(() => {
      this.allowClose = true;

      const element: HTMLElement = document.querySelector('[data-widget-id=a5597606-d3c6-11e8-a8d5-f2801f1b9fd1]');

      if (element) {
        element.style.bottom = '0px';
      }
    }, 1500);

    // TODO We can't use this.windowService because in this case same event is not received by second checkout
    // this.windowService.messageEvent$.pipe(takeUntil(this.destroyed$)).subscribe((event: MessageEvent) => {
    fromEvent(window, 'message')
      .pipe(
        startWith(void 0), // always start from last event
        shareReplay(1), // always emit latest message for subscriber
        filter(Boolean),
        takeUntil(this.destroyed$),
      )
      .subscribe((event: MessageEvent) => {
        const eventName: string = event.data.event;
        const eventValue: any = event.data.value;

        if (event.source !== this.iframe.contentWindow) {
          // We listen only our iframe
          return;
        }

        switch (eventName) {
          case 'payeverCheckoutHeightChangedEx':
            if (this.iframe && this.iframe.contentWindow && eventValue.flowId === this.flowId) {
              this.iframeWrap.style.height = `${eventValue.value}px`;
            }
            break;
          case 'payeverCheckoutCartChanged':
            const flowCartItems: FlowBodyCartInterface[] = eventValue.cart || [];
            this.updateCart(flowCartItems);
            break;
          case 'payeverCheckoutFlowFinished':
            this.clearCardOnClose = true;
            break;
          case 'payeverCheckoutAfterFlowClone':
            if (this.iframe && this.iframe.contentWindow && eventValue.prevFlowId === this.flowId) {
              this.flowId$.next(eventValue.nextFlowId);
            }
            break;
          case 'payeverCheckoutStepPanelOpened':
            if (
              !this.hidden
              && eventValue
              && isNumber(eventValue.topOffset)
              && eventValue.topOffset < window.pageYOffset
            ) {
              applyScrollTop(eventValue.topOffset);
            }
            break;
          case 'payeverCheckoutModalShow':
            if (!this.hidden) {
              const iframeHeight = parseInt(this.iframeWrap.style.height);
              const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
              if (iframeHeight > height) {
                applyScrollTop((iframeHeight - height) / 2);
              }
            }
            break;
          default:
            break;
        }
      });

    // TODO Following block doesn't work, need to find out why
    this.messageBusService
      .observe(window, 'checkout', 'close')
      .pipe(
        takeUntil(this.destroyed$),
        // filter(() => !this.settingsService.checkoutCloseLock),
        filter(event => (this.flowId && event.data && event.data.flowId ? this.flowId === event.data.flowId : true)),
      )
      .subscribe(event => {
        if (this.clearCardOnClose) {
          this.clearCardOnClose = false;
          this.cartService.clearItems();
          this.checkoutService.reCreateFlows(this.envService.channelSet);
        }

        this.cartService.checkCartItems();
        this.closeCheckout();
      });
  }

  private closeCheckout(): void {
    if (this.allowClose && this.checkoutFlowMicroUrl) {
      window.postMessage('close-custom-page', '*');
      window.scrollTo({ top: 0 });
    }
  }

  private openCheckout(): void {
    if (!this.checkoutFlowMicroUrl) {
      this.checkoutFlowMicroUrl = this.checkoutService.getCheckoutFlowUrl(this.mode === 'cart');
      if (this.checkoutFlowMicroUrl) {
        this.chRef.detectChanges();
        this.initCheckoutMicro();
      }
    }
  }

  private createIframeHtml(): void {
    if (!this.iframe) {
      this.iframeWrapWrap = this.renderer.createElement('div');
      this.iframeWrap = this.renderer.createElement('div');
      this.iframe = this.renderer.createElement('iframe');

      this.renderer.appendChild(this.iframeWrapWrap, this.iframeWrap);
      this.renderer.appendChild(this.iframeWrap, this.iframe);
      this.renderer.appendChild(this.document.body, this.iframeWrapWrap);

      this.iframeWrapWrap.setAttribute(
        'style',
        'display: block; position: absolute; top: 0; left: 0; right: 0; text-align: center; z-index: 20000;',
      );
      this.iframeWrap.setAttribute(
        'style',
        'display: inline-block; width: 100%; max-width: 768px; border-radius: 0px 0px 8px 8px; overflow: hidden; transform: scale(1,1);',
      );
      this.iframe.setAttribute('style', 'width: 100%; height: 100%;');

      this.iframe.setAttribute('frameborder', '0');
      this.iframe.setAttribute(
        'sandbox',
        'allow-same-origin allow-top-navigation allow-forms allow-scripts allow-modals allow-popups',
      );

      this.iframeWrapWrap.style.top = this.hidden ? '-20000px' : '0px';
    }
  }

  private destroyIframeHtml(): void {
    if (this.iframe) {
      this.renderer.removeChild(this.iframeWrap, this.iframe);
      this.renderer.removeChild(this.iframeWrapWrap, this.iframeWrap);
      this.renderer.removeChild(this.document.body, this.iframeWrapWrap);
      this.iframe = null;
      this.iframeWrap = null;
      this.iframeWrapWrap = null;
    }
  }

  private updateCart(flowCartItems: FlowBodyCartInterface[]): void {
    if (this.cartService.items) {
      for (let i = 0; i < this.cartService.items.length; i++) {
        const flowItem: FlowBodyCartInterface = flowCartItems.find(
          (flowItemValue: FlowBodyCartInterface) => flowItemValue.uuid === this.cartService.items[i].itemId,
        );
        if (flowItem) {
          this.cartService.updateItemQuantity(this.cartService.items[i].itemId, flowItem.quantity);
        } else {
          this.cartService.removeFromCart(this.cartService.items[i].itemId);
          i--;
        }
      }
    }
  }
}

const applyScrollTop = (offset: number): void => {
  if (isIE() || isIOS()) {
    setTimeout(() => {
      document.documentElement.scrollTop = offset;
    }, 200);
  } else {
    window.scrollTo({ left: 0, top: offset, behavior: 'smooth' });
  }
};

const isIOS = (): boolean => {
  // tslint:disable-next-line:no-string-literal
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window['MSStream'];
};

const isIE = (): boolean => {
  const ua = window.navigator.userAgent;

  return /MSIE|Trident/.test(ua);
};
