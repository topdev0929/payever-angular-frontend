import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebAutoHideScrollbarModule } from '@pe/builder/editor-utils';

import { PebSelectOptionListComponent } from './option-list.component';
import { PebSelectComponent } from './select.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebAutoHideScrollbarModule,
  ],
  declarations: [
    PebSelectComponent,
    PebSelectOptionListComponent,
  ],
  exports: [
    PebSelectComponent,
    PebSelectOptionListComponent,
  ],
})
export class PebSelectInputModule {
}
