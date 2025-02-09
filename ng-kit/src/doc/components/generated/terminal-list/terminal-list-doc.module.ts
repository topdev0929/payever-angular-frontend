import { NgModule } from '@angular/core';
import { TerminalListDocComponent } from './terminal-list-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { TerminalListModule } from '../../../../kit/terminal-list/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    TerminalListModule
  ],
  declarations: [TerminalListDocComponent]
})
export class TerminalListDocModule {
}
