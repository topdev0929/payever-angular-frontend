// tslint:disable
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as cookie from 'cookie';
import { tap } from 'rxjs/operators';

import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';

@Injectable()
export class DevHelpersService {
  constructor(private httpClient: HttpClient, private config: EnvironmentConfigService) {
    (window as any).devHelperService = this;
  }

  get authApi() {
    return this.config.getConfig().backend.auth + '/api';
  }

  get userApi() {
    return this.config.getConfig().backend.users + '/api';
  }

  get shopsApi() {
    return this.config.getConfig().backend.shops + '/api';
  }

  get posApi() {
    return this.config.getConfig().backend.pos + '/api';
  }

  getAuthHeaders() {
    const credentials = this.getCredentials();
    return {
      authorization: `Bearer ${credentials.pe_auth_token}`,
    };
  }

  getCredentials() {
    return cookie.parse(document.cookie);
  }

  getAccessToken(user: string, password: string) {
    return this.httpClient
      .post(`${this.authApi}/login`, {
        email: user,
        plainPassword: password,
      })
      .pipe(
        tap((result: any) => {
          document.cookie = cookie.serialize('pe_auth_token', result.accessToken);
          document.cookie = cookie.serialize('pe_refresh_token', result.refreshToken);
        }),
      );
  }

  getBusinesses() {
    return this.httpClient.get<any[]>(`${this.userApi}/business`, {
      headers: this.getAuthHeaders(),
    });
  }

  getShops(business: any) {
    return this.httpClient.get<any[]>(`${this.shopsApi}/business/${business}/shop`, {
      headers: this.getAuthHeaders(),
    });
  }

  getTerminals(business: any) {
    return this.httpClient.get<any[]>(`${this.posApi}/business/${business}/terminal`, {
      headers: this.getAuthHeaders(),
    });
  }
}
