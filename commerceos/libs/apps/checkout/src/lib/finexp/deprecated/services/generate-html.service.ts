import { Inject, Injectable, Injector } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';

import { DEFAULT_BANNER_PRICE } from '../interfaces';
import { EnvConfig } from '../interfaces/env-config.interfaces';

import { FinexpStorageAbstractService } from './index';

const debugFinExpress: boolean = window.location.host === 'localhost:8080';

@Injectable()
export class GenerateHtmlService {

  protected storageService: FinexpStorageAbstractService = this.injector.get(FinexpStorageAbstractService);

  private defaultBannerPrice: number = DEFAULT_BANNER_PRICE;

  private data: EnvConfig = {};
  get config(): EnvConfig {
    return this.data;
  }

  constructor(@Inject(PE_ENV) private env: EnvInterface,
              protected injector: Injector) {}

  generateEmbedCode(widgetType: string, channelSetId: string, demo: boolean = true): Observable<string> {
    return this.createEmbedElementDiv(widgetType, channelSetId, demo).pipe(map((div) => {
      return div.outerHTML + this.createEmbedElementScript(widgetType, channelSetId).outerHTML;
    }));
  }

  setOption(name: string, value: any): void {
    this.data[name] = value;
  }

  createEmbedElementDiv(widgetType: string, channelSetId: string, demo: boolean = true): Observable<HTMLDivElement> {
    // return this.storageService.getCurrencyByChannelSetIdOnce(channelSetId).pipe(map((currency: string) => {
    const e: HTMLDivElement = document.createElement('div');
    e.setAttribute('class', `payever-finance-express payever-${widgetType}`);
    e.setAttribute('data-code', 'SW10132.7');
    e.setAttribute('data-name', 'Nordic Jacket Women');
    e.setAttribute('data-price', this.defaultBannerPrice.toFixed(2));
    if (demo) {
      e.setAttribute('data-demo', '1');
    }

    return of(e);
  }

  createEmbedElementScript(widgetType: string, channelSetId: string): HTMLScriptElement {
    const s: HTMLScriptElement = document.createElement('script');
    const url: string = this.getEmbedScriptUrl(widgetType, channelSetId);
    s.text = `
        (function(p,a,y,e,v,r,f) {p[v]=p[v]||[]; p[v][r]=p[v][r]||[]; if(!p[v][r][y]){
        p[v][r][y]=f=a.createElement(y); f.async=1; f.src=e; a.head.appendChild(f)}
        })(window, document, 'script', '${url}', 'Payever', 'FinanceExpress');
    `;

    return s;
  }

  getEmbedScriptUrl(widgetType: string, channelSetId: string): string {
    if (debugFinExpress) {
      console.warn('Remember that `npm run start:finexp` should be running in parallel!');
      const query: string = `?businessUuid=${encodeURIComponent(this.storageService.businessUuid)}` +
                            `&channelSetId=${encodeURIComponent(channelSetId)}`;

      return `http://localhost:8081/finance_express.embed.min.js${query}`;
    }
    const domain = this.env.frontend.checkout;

    return `${domain}/finance/business/${this.storageService.businessUuid}/channel/${channelSetId}/finance_express.embed.min.js?`;
  }

}
