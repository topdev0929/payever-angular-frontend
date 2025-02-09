import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SnackBarService } from '@pe/forms-core';
import { I18nModule } from '@pe/i18n';
import { ThirdPartyFormModule } from '@pe/tpm';

import { PeQrPrintComponent } from './qr-print.component';


@NgModule({
  imports: [
    CommonModule,
    ThirdPartyFormModule,
    MatSnackBarModule,
    I18nModule.forRoot(),
  ],
  declarations: [
    PeQrPrintComponent,
  ],
  exports: [
    PeQrPrintComponent,
  ],
  providers: [
    SnackBarService,
  ],
})
export class PeQrPrintModule {
}
