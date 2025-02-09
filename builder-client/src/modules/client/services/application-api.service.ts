import { Injectable } from '@angular/core';
import { TransferHttpService } from '@gorniv/ngx-universal';
import { Observable } from 'rxjs';

import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';

export interface AppModelInterface {
  name: string;
  logo?: string;
  theme: string;
  channelSet?: string;
}

@Injectable({ providedIn: 'root' })
export class ApplicationApiService {
  constructor(
    private config: EnvironmentConfigService,
    private httpClient: TransferHttpService,
  ) {}

  get shopApi(): string {
    return `${this.config.getConfig().backend.shops}/api`;
  }

  get posApi(): string {
    return `${this.config.getConfig().backend.pos}/api`;
  }

  get marketingApi(): string {
    return `${this.config.getConfig().backend.marketing}/api`;
  }

  getShop(businessId: string, shopId: string): Observable<AppModelInterface> {
    const path: string = this.getShopApiUrl(businessId, shopId);

    return this.httpClient.get<AppModelInterface>(path);
  }

  getTerminal(businessId: string, terminalId: string): Observable<AppModelInterface> {
    const path: string = this.getPosApiUrl(businessId, terminalId);

    return this.httpClient.get<AppModelInterface>(path);
  }

  private getShopApiUrl(businessId: string, shopId: string): string {
    return `${this.shopApi}/business/${businessId}/shop/${shopId}`;
  }

  private getPosApiUrl(businessId: string, terminalId: string): string {
    return `${this.posApi}/business/${businessId}/terminal/${terminalId}`;
  }
}
