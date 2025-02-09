import { Injectable, inject } from '@angular/core';
import {
  NgxsAfterBootstrap,
  State,
  StateContext,
} from '@ngxs/store';

import { StorageService } from '@pe/checkout/storage';
import {
  ACCESS_TOKEN_NAME,
  AuthState,
  AuthStateModel,
  BaseAuthState,
  SetTokens,
} from '@pe/checkout/store/auth';

@State<AuthStateModel>({
  name: AuthState,
  defaults: null,
})
@Injectable()
export class StandaloneAuthState extends BaseAuthState implements NgxsAfterBootstrap {
  private storageService = inject(StorageService);

  ngxsAfterBootstrap({ dispatch }: StateContext<AuthStateModel>) {
    try {
      const accessToken = this.storageService.get(ACCESS_TOKEN_NAME)
        ?? new URL(window.location.href).searchParams.get('guest_token');
      dispatch(new SetTokens({ accessToken }));
    } catch { }
  }
}
