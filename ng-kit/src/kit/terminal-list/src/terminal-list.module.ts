import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalListComponent } from './terminal-list.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    TerminalListComponent
  ],
  entryComponents: [ TerminalListComponent ],
  exports: [ TerminalListComponent ]
})
export class TerminalListModule {}
