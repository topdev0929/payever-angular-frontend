import { Injectable } from '@angular/core';
import { TransferHttpService } from '@gorniv/ngx-universal';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { PasswordConfigInterface } from '../../../../ssr/interfaces';

@Injectable({ providedIn: 'root' })
export class PasswordControlService {
  passwordEnabled = false;
  passwordLock = false;
  passwordEntered$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  message$: BehaviorSubject<string> = new BehaviorSubject('');

  constructor(
    private configService: EnvironmentConfigService,
    private transferHttpService: TransferHttpService,
  ) {}

  getPasswordConfig(applicationId: string, businessId: string): Observable<PasswordConfigInterface> {
    const path = `${this.configService.getBackendConfig().shops}/api/business/${businessId}/shop/${applicationId}/password`;

    return this.transferHttpService.get<any>(path).pipe(map((config: PasswordConfigInterface) => {
      return config ? config : null;
    }));
  }

  retrieveToken(applicationId: string, businessId: string, password: string): Observable<any> {
    const path = `${this.configService.getBackendConfig().shops}/api/business/${businessId}/shop/${applicationId}/create-token`;

    return this.transferHttpService.post<any>(path, { password }).pipe(map((token: any) => {
      return token ? token : null;
    }));
  }

  checkToken(domain: string, token: string): Observable<boolean> {
    const path = `${this.configService.getBackendConfig().builder}/api/domain/name/${domain}`;

    return this.transferHttpService.get<any>(path, { headers: { Authorization: `Bearer ${token}` } }).pipe(map((domainInfo: any) => {
      if (domainInfo && domainInfo.name) {
        return true;
      }

      return false;
    }));
  }
}
