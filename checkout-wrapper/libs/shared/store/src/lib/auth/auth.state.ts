import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Action,
  SelectorOptions,
  State,
  StateContext,
  StateToken,
} from '@ngxs/store';
import { catchError, mergeMap, switchMap } from 'rxjs/operators';

import { StorageService } from '@pe/checkout/storage';
import { LocaleConstantsService } from '@pe/checkout/utils';

import {
  Login,
  Logout,
  RefreshToken,
  Register,
  SetTokens,
  UpdateFlowAuthorization,
} from './auth.actions';
import { AuthApiService } from './services';

export const ACCESS_TOKEN_NAME = 'pe_auth_token';
export const REFRESH_TOKEN_NAME = 'pe_refresh_token';
export const GUEST_TOKEN_NAME = 'pe_guest_token';

export interface AuthStateModel {
  accessToken: string;
  refreshToken: string;
}

export const AuthState = new StateToken<AuthStateModel>('auth');

@State<AuthStateModel>({
  name: 'auth',
  defaults: null,
})
@SelectorOptions({
  injectContainerState: false,
  suppressErrors: false,
})
@Injectable()
export class BaseAuthState {

  private readonly api = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly localeConstantsService = inject(LocaleConstantsService);
  private storage = inject(StorageService);

  @Action(SetTokens)
  setTokens(
    { patchState }: StateContext<AuthStateModel>,
    { payload }: SetTokens,
  ) {
    const { accessToken, refreshToken } = payload;
    this.storage.set(ACCESS_TOKEN_NAME, accessToken);

    if (refreshToken) {
      this.storage.set(REFRESH_TOKEN_NAME, refreshToken);
    } else {
      this.storage.remove(REFRESH_TOKEN_NAME);
    }

    patchState({ ...payload });
  }

  @Action(Login)
  login(
    { dispatch }: StateContext<AuthStateModel>,
    { payload }: Login,
  ) {
    return this.api.login(payload).pipe(
      switchMap(response => dispatch(new SetTokens(response))),
    );
  }

  @Action(Logout)
  logout(
    { setState }: StateContext<AuthStateModel>,
  ) {
    this.storage.remove(ACCESS_TOKEN_NAME);
    this.storage.remove(REFRESH_TOKEN_NAME);

    setState(null);

    return this.router.navigate(['/']);
  }

  @Action(Register)
  register(
    { getState, dispatch }: StateContext<AuthStateModel>,
    { flowId, payload, config }: Register,
  ) {
    const { country, ...dto } = payload;
    const { accessToken } = getState();

    return this.api.register({
      ...dto,
      ...country && { language: this.getLocale(country) },
    }).pipe(
      switchMap(response => dispatch(new SetTokens(response)).pipe(
        switchMap(() => this.api.createUserAccount(config).pipe(
          switchMap(() => dispatch(new UpdateFlowAuthorization(flowId, accessToken))),
        )),
      )),
    );
  }

  @Action(RefreshToken)
  refreshToken(
    { dispatch }: StateContext<AuthStateModel>,
    { token }: RefreshToken,
  ) {
    return this.api.refreshToken(token).pipe(
      switchMap(response => dispatch(new SetTokens(response)).pipe(
        mergeMap(() => this.api.proxySetToken(response.accessToken, ACCESS_TOKEN_NAME)),
      )),
      catchError(() => dispatch(new Logout()))
    );
  }

  @Action(UpdateFlowAuthorization)
  updateFlowAuthorization(
    { getState }: StateContext<AuthStateModel>,
    { flowId, oldToken }: UpdateFlowAuthorization,
  ) {
    const { accessToken } = getState();

    return this.api.updateAuthorization(flowId, accessToken, oldToken);
  }

  private getLocale(country: string): string {
    const locales = this.localeConstantsService.getLocales();

    return locales[country] && country;
  }
}
