import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';

import { LocaleConstantsService } from '@pe/checkout/utils';

const INSTANT_PAYMENT_SCRIPT_URL = 'https://api.xs2a.com/xs2a.js';
const INSTANT_PAYMENT_STYLE_URL = 'https://api.xs2a.com/xs2a.css';

export enum InstantPaymentActionEnum {
  Abort = 'abort',
  Finish = 'finish',
  Init = 'init',
}

@Injectable()
export class InstantPaymentService {
  constructor(
    private localeConstantsService: LocaleConstantsService
  ) {

  }

  load(): Observable<InstantPaymentActionEnum> {
    return new Observable((sub) => {
      if (document.querySelector(`script[src="${INSTANT_PAYMENT_SCRIPT_URL}"]`) && !!(window as any).xs2a) {
        setTimeout(() => {
          this.initEvents(sub);
        });
      } else {
        const script: HTMLScriptElement = document.createElement('script');
        script.type = 'text/javascript';
        script.src = INSTANT_PAYMENT_SCRIPT_URL;
        script.onload = () => {
          this.initEvents(sub);
        };
        document.getElementsByTagName('head')[0].appendChild(script);
      }

      this.addStyles(INSTANT_PAYMENT_STYLE_URL);
    });
  }

  private addStyles(href: string): void {
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link: HTMLLinkElement = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }

  private initEvents(sub: Subscriber<InstantPaymentActionEnum>): void {
    const lang = this.localeConstantsService.getLang();
    const xs2a: any = (window as any).xs2a;
    xs2a.useBaseStyles();
    xs2a.lang(lang);
    xs2a.finish(() => sub.next(InstantPaymentActionEnum.Finish));
    xs2a.abort(() => sub.next(InstantPaymentActionEnum.Abort));
    xs2a.init();
    sub.next(InstantPaymentActionEnum.Init);
  }
}
