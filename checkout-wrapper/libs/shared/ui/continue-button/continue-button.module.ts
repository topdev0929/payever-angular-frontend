import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { ProgressButtonContentModule } from '@pe/checkout/ui/progress-button-content';

import { ContinueButtonComponent } from './continue-button.component';
import { ContinueButtonStylesComponent } from './styles/continue-button-styles.component';

@NgModule({
  declarations: [
    ContinueButtonComponent,
    ContinueButtonStylesComponent,
  ],
  imports: [
    MatButtonModule,

    ProgressButtonContentModule,
  ],
  exports: [
    ContinueButtonComponent,
  ],
})
export class ContinueButtonModule {}
