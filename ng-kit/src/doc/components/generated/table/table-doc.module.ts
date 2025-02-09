import { NgModule } from '@angular/core';
import { TableDocComponent } from './table-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { TableDocDefaultExampleComponent } from './examples/table-doc-default-example';
import { TableModule } from '../../../../kit/table/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    TableModule
  ],
  declarations: [
    TableDocComponent,
    TableDocDefaultExampleComponent
  ],
  exports: [
    TableDocComponent
  ]
})
export class TableDocModule {
}
