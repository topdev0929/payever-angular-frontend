import { Injectable } from '@angular/core';
import { Selector } from '@ngxs/store';

import { AuthState, AuthStateModel } from './auth.state';

@Injectable()
export abstract class AuthSelectors {

  @Selector([AuthState])
  public static accessToken(state: AuthStateModel): string {
    return state?.accessToken;
  }

  @Selector([AuthState])
  public static refreshToken(state: AuthStateModel): string {
    return state?.refreshToken;
  }

  @Selector() static guestTokenQueryParam() {
    const guestToken = new URL(window.location.href).searchParams.get('guest_token');

    return guestToken && { guest_token: guestToken };
  }
}
