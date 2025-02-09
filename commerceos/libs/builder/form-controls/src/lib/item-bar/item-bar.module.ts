import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebItemBarComponent } from './item-bar.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    PebItemBarComponent,
  ],
  exports: [
    PebItemBarComponent,
  ],
})
export class PebItemBarModule {
}
