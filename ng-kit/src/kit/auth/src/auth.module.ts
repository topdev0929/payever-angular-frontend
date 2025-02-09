import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, ModuleWithProviders } from '@angular/core';

import { AuthGuard, DevAuthGuard, RefreshTokenGuard, SecondFactorGuard, ResetTemporarySecondFactorGuard, TemporarySecondFactorJustPassedOnlyGuard } from './guards';
import { AuthService, AuthInterceptor, SessionService } from './services';

@NgModule({
  providers: [
    AuthGuard,
    DevAuthGuard,
    RefreshTokenGuard,
    SecondFactorGuard,
    ResetTemporarySecondFactorGuard,
    TemporarySecondFactorJustPassedOnlyGuard
  ]
})
export class AuthModule {
  // @TODO - update any to relevant interface
  static forRoot(config?: any): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule,
      providers: [
        AuthService,
        DevAuthGuard,
        SessionService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          deps: [AuthService],
          multi: true
        },
      ]
    };
  }
}
