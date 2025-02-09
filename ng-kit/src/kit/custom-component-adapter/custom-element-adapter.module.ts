import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomElementAdapter } from './components';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ CustomElementAdapter ],
  entryComponents: [ CustomElementAdapter ],
  exports: [ CustomElementAdapter ]
})
export class CustomElementAdapterModule {}
