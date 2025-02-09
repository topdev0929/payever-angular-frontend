import { Inject, Injectable, Injector } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';
import { WidgetTypeEnum } from '@pe/checkout-types';
import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';

import { EnvConfig } from '../deprecated/interfaces';
import { FinexpStorageAbstractService } from './finexp-storage.abstract.service';

@Injectable()
export class GenerateHtmlService {

  protected storageService: FinexpStorageAbstractService = this.injector.get(FinexpStorageAbstractService);
  protected translateService: TranslateService = this.injector.get(TranslateService);

  private data: EnvConfig = {};

  get config(): EnvConfig {
    return this.data;
  }

  constructor(@Inject(PE_ENV) private env: EnvInterface,
              protected injector: Injector) {
  }

  generateEmbedCode(widgetId: string, checkoutId: string, amount: number = 2500, widgetType: WidgetTypeEnum): Observable<string> {
    return this.createEmbedElementDiv(widgetId, checkoutId, amount, widgetType).pipe(map(div => {
      return (div.outerHTML + '\n ' + this.createEmbedElementScript().outerHTML.trim()).trim();
    }));
  }

  createEmbedElementDiv(widgetId: string, checkoutId: string, amount: number, widgetType: WidgetTypeEnum): Observable<HTMLDivElement> {
    const e: HTMLDivElement = document.createElement('div');
    e.setAttribute('class', `payever-widget-finexp`);
    e.setAttribute('data-widgetId', widgetId);
    e.setAttribute('data-checkoutId', checkoutId);
    e.setAttribute('data-business', `${this.storageService.businessUuid}`);
    e.setAttribute('data-type', widgetType);
    e.setAttribute('data-reference', 'order-id');
    e.setAttribute('data-amount', amount.toFixed(2));
    e.innerHTML = ``;
    return of(e);
  }

  createEmbedElementScript(): HTMLScriptElement {
    const s: HTMLScriptElement = document.createElement('script');
    const url = this.env.custom['widgetsCdn'] ?
      `${this.env.custom['widgetsCdn']}/finance-express/widget.min.js` :
      `${this.env.frontend.commerceos}/pe-finexp-widget.min.js`;
    s.text = `
  var script = document.createElement('script');
  script.src = '${url}';
  script.onload = function() {
    PayeverPaymentWidgetLoader.init(
    '.payever-widget-finexp'
    );
  };
  document.head.appendChild(script);
`;
    return s;
  }
}
