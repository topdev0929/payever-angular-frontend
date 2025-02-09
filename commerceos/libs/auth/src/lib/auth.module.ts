import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, ModuleWithProviders, Injector } from '@angular/core';

import {
  AuthGuard,
  DevAuthGuard,
  RefreshTokenGuard,
  ResetTemporarySecondFactorGuard,
  SecondFactorGuard,
  TemporarySecondFactorJustPassedOnlyGuard,
} from './guards';
import { AuthInterceptor, PeAuthService } from './services';

export function CreateAuthInterceptor(injector: Injector) {
  return new AuthInterceptor(injector);
}

// @dynamic
@NgModule({
  providers: [
    AuthGuard,
    DevAuthGuard,
    RefreshTokenGuard,
    SecondFactorGuard,
    ResetTemporarySecondFactorGuard,
    TemporarySecondFactorJustPassedOnlyGuard,
  ],
})
export class AuthModule {
  static forRoot(): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule,
      providers: [
        PeAuthService,
        DevAuthGuard,
        // We can't have it in forRoot() because in this case it's not passed into lazy module.
        // But please avoid double import to not get 403 load translations error!
        {
          provide: HTTP_INTERCEPTORS,
          useFactory: CreateAuthInterceptor,
          deps: [Injector],
          multi: true,
        },
      ],
    };
  }
}
