import { Injectable } from '@angular/core';
import { NgxsOnInit, State, StateContext } from '@ngxs/store';

import {
  ACCESS_TOKEN_NAME,
  AuthState,
  AuthStateModel,
  BaseAuthState,
  REFRESH_TOKEN_NAME,
  SetTokens,
} from '@pe/checkout/store';

@State<AuthStateModel>({
  name: AuthState,
  defaults: null,
})
@Injectable()
export class CeAuthState extends BaseAuthState implements NgxsOnInit {
  ngxsOnInit({ dispatch }: StateContext<AuthStateModel>): void {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_NAME)
        ?? new URL(window.location.href).searchParams.get('guest_token');
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_NAME);
      dispatch(new SetTokens({ accessToken, refreshToken }));
    } catch { }
  }
}
