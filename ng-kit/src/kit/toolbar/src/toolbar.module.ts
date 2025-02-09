import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';

import { ToolbarComponent } from './toolbar.component';
import { ToolbarChildComponent } from './toolbar-row/toolbar-child.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    MatToolbarModule,
    CommonModule
  ],
  declarations: [
    ToolbarComponent,
    ToolbarChildComponent
  ],
  entryComponents: [
    ToolbarComponent
  ],
  exports: [
    ToolbarComponent,
    ToolbarChildComponent,
    CommonModule
  ]
})
export class ToolbarModule {}
