import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import * as cookie from 'cookie';
import { EnvironmentConfigInterface as EnvInterface, NodeJsBackendConfigInterface, PE_ENV } from '@pe/common';

function foo() {
  console.log(cookie);
}

@Injectable()
export class DevHelpersService {
  constructor(
    private httpClient: HttpClient,
    @Inject(PE_ENV) private envConfig: EnvInterface,
  ) {
    (window as any).devHelper = this;
  }

  get authApi() {
    return this.envConfig.backend.auth + '/api';
  }

  get userApi() {
    return this.envConfig.backend.users + '/api';
  }

  getAuthHeaders() {
    const credentials = this.getCredentials();
    return {
      authorization: `Bearer ${credentials.pe_auth_token}`
    };
  }

  getCredentials() {
    return cookie.parse(document.cookie);
  }

  getAccessToken(user: string, password: string) {
    return this.httpClient.post(`${this.authApi}/login`, {
      email: user,
      plainPassword: password,
    }).pipe(
      tap((result: any) => {
        document.cookie = cookie.serialize('pe_auth_token', result.accessToken);
        document.cookie = cookie.serialize('pe_refresh_token', result.refreshToken);
      })
    );
  }

  getBusinesses() {
    return this.httpClient.get<any[]>(`${this.userApi}/business`, {
      headers: this.getAuthHeaders(),
    });
  }

}

