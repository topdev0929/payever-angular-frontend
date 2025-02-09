import { NgModule } from '@angular/core';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ListDocComponent } from './list-doc.component';
import { ListDefaultExampleDocComponent, NavListExampleDocComponent, SelectionListExampleDocComponent } from './examples';
import { ListModule } from '../../../../kit/list/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    ListModule
  ],
  declarations: [
    ListDocComponent,
    ListDefaultExampleDocComponent,
    SelectionListExampleDocComponent,
    NavListExampleDocComponent
  ],
  exports: [ListDocComponent]
})
export class ListDocModule {

}
