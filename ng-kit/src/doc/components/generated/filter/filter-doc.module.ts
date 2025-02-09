import { NgModule } from '@angular/core';
import { FilterDocComponent } from './filter-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { FilterModule } from '../../../../kit/filter/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    FilterModule
  ],
  declarations: [FilterDocComponent]
})
export class FilterDocModule {
}
