import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SnackBarService } from '@pe/forms-core';
import { ThirdPartyFormModule } from '@pe/forms';
import { I18nModule } from '@pe/i18n';

import { PeQrPrintComponent } from './qr-print.component';

export const i18n = I18nModule.forRoot();

@NgModule({
  declarations: [PeQrPrintComponent],
  imports: [
    CommonModule,
    ThirdPartyFormModule,
    i18n,
  ],
  providers: [
    MatSnackBarModule,
    SnackBarService,
  ],
})
export class PeQrPrintModule { }
