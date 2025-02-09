import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebDirectivesModule } from '@pe/builder/directives';

import { PebVectorElementComponent } from './vector-element.component';

@NgModule({
  imports: [CommonModule, PebDirectivesModule],
  declarations: [PebVectorElementComponent],
  exports: [PebVectorElementComponent],
})
export class PebVectorElementModule {}
