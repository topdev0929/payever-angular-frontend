import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { BYPASS_AUTH } from '@pe/checkout/api';
import { PE_ENV } from '@pe/common';

import {
  CreateUserAccountConfigDto,
  LoginDto,
  LoginResponse,
  RegisterDto,
  RegisterResponse,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {

  private readonly http = inject(HttpClient);
  private readonly env = inject(PE_ENV);

  public createUserAccount(config: CreateUserAccountConfigDto) {
    return this.http.post<void>(`${this.env.backend.users}/api/user`, config);
  }

  public login(payload: LoginDto) {
    return this.http.post<LoginResponse>(
      `${this.env.backend.auth}/api/login`,
      payload,
      {
        context: new HttpContext().set(BYPASS_AUTH, true),
      },
    );
  }

  public register(payload: RegisterDto) {
    return this.http.post<RegisterResponse>(
      `${this.env.backend.auth}/api/register`,
      payload,
    );
  }

  public refreshToken(token: string) {
    return this.http.get<LoginResponse>(
      `${this.env.backend.auth}/api/refresh`,
      {
        withCredentials: true,
        context: new HttpContext()
          .set(BYPASS_AUTH, true),
        headers: new HttpHeaders()
          .append('Authorization', `Bearer ${token}`),
      },
    );
  }

  public proxySetToken(token: string, tokenName: string) {
    return this.http.post<void>(
      `${this.env.custom.proxy}/api/set-cookie/${tokenName}/${token}`,
      {},
      {
        withCredentials: true,
        context: new HttpContext().set(BYPASS_AUTH, true),
      },
    );
  }

  public updateAuthorization(flowId: string, newToken: string, oldToken: string) {
    return this.http.patch<void>(
      `${this.env.backend.checkout}/api/flow/v1/${flowId}/authorization`,
      { token: newToken },
      {
        context: new HttpContext().set(BYPASS_AUTH, true),
        headers: new HttpHeaders().append('authorization', `Bearer ${oldToken}`),
      },
    );
  }
}
