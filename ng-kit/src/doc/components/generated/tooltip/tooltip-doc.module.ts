import { NgModule } from '@angular/core';
import { TooltipDocComponent } from './tooltip-doc.component';
import { TooltipExampleComponent } from './examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { TooltipModule } from '../../../../kit/tooltip/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    TooltipModule
  ],
  declarations: [
    TooltipDocComponent,
    TooltipExampleComponent
  ]
})
export class TooltipDocModule {
}
