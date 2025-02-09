import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { UiIconComponent } from './ui-icon.component';

@NgModule({
  declarations: [UiIconComponent],
  imports: [
    MatIconModule,
  ],
  exports: [UiIconComponent],
})
export class CheckoutUiIconModule {}
