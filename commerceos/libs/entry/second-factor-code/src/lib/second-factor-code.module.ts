import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Routes } from '@angular/router';

import { ButtonModule } from '@pe/button';
import { LoginFormService } from '@pe/entry/login';
import { EntrySharedModule } from '@pe/entry/shared';
import { I18nModule } from '@pe/i18n';
import { PeAuthCodeModule, PebButtonModule } from '@pe/ui';

import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { LoginSecondFactorCodeComponent } from './login-second-factor-code/login-second-factor-code.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [RefreshTokenGuard],
    component: LoginSecondFactorCodeComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    ButtonModule,
    ReactiveFormsModule,
    I18nModule.forChild(),
    RouterModule.forChild(routes),
    MatButtonModule,
    EntrySharedModule,
    PebButtonModule,
    PeAuthCodeModule,
  ],
  exports: [LoginSecondFactorCodeComponent],
  declarations: [LoginSecondFactorCodeComponent],
  providers: [LoginFormService],
})
export class SecondFactorCodeModule {}
