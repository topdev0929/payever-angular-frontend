import { NgModule } from '@angular/core';

import { RefreshTokenGuard } from './guards';

@NgModule({
  imports: [
  ],
  providers: [
    RefreshTokenGuard,
  ],
})
export class AuthModule {}
