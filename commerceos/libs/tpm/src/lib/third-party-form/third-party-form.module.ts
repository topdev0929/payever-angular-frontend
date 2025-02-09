import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { FormModule } from '@pe/forms';
import { FormCoreModule } from '@pe/forms-core';
import { I18nModule, TranslatePipe } from '@pe/i18n';
import { SnackbarModule } from '@pe/snackbar';

import {
  ProgressButtonContentComponent,
  ThirdPartyFormComponent,
  ThirdPartyRootFormComponent,
} from './components';

export const I18N = I18nModule.forChild();

@NgModule({
  declarations: [
    ThirdPartyFormComponent,
    ThirdPartyRootFormComponent,
    ProgressButtonContentComponent,
  ],
  imports: [
    CommonModule,
    I18nModule.forChild(),
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatExpansionModule,
    MatMenuModule,
    MatSlideToggleModule,
    FormModule,
    FormCoreModule,
    SnackbarModule,
  ],
  exports: [
    ThirdPartyFormComponent,
    ThirdPartyRootFormComponent,
  ],
  providers: [
    TranslatePipe,
  ],
})
export class ThirdPartyFormModule { }
