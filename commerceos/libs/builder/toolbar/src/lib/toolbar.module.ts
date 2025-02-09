import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';

import { PebNumberInputModule, PebRangeInputModule } from '@pe/builder/form-controls';
import { I18nModule } from '@pe/i18n';
import { PebButtonModule } from '@pe/ui';

import { PebOverlayModule } from './overlay/overlay.module';
import { PebScreenDialogComponent } from './screen/screen-dialog.component';
import { PebScreensDialogComponent } from './screens/screens-dialog.component';
import { PebToolbarComponent } from './toolbar.component';
import { PebZoomDialogComponent } from './zoom/zoom-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: PebToolbarComponent,
      },
    ]),
    MatIconModule,
    PebOverlayModule,
    PebRangeInputModule,
    PebNumberInputModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    PebButtonModule,
    I18nModule,
  ],
  declarations: [
    PebToolbarComponent,
    PebScreenDialogComponent,
    PebZoomDialogComponent,
    PebScreensDialogComponent,
  ],
  exports: [
    PebScreenDialogComponent,
    PebOverlayModule,
  ],
})
export class PebToolbarModule {
}
