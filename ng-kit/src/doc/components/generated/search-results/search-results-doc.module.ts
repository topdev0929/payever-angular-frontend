import { NgModule } from '@angular/core';
import { SearchResultsDocComponent } from './search-results-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { SearchResultsModule } from '../../../../kit/search-results';

@NgModule({
  imports: [
    DocComponentSharedModule,
    SearchResultsModule
  ],
  declarations: [SearchResultsDocComponent]
})
export class SearchResultsDocModule {
}
