import { NgModule } from '@angular/core';
import { SearchDocComponent } from './search-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { SearchModule } from '../../../../kit/search';

@NgModule({
  imports: [
    DocComponentSharedModule,
    SearchModule
  ],
  declarations: [SearchDocComponent]
})
export class SearchDocModule {
}
