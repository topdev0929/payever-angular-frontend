import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AbbreviationPipe } from './abbreviation.pipe';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    AbbreviationPipe,
  ],
  exports: [
    AbbreviationPipe,
  ],
})
export class PeAbbreviationPipeModule {
}
