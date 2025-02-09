import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';

import { SearchResultsComponent } from './search-results.component';

@NgModule({
  imports: [
    CommonModule,
    MatListModule
  ],
  declarations: [
    SearchResultsComponent
  ],
  entryComponents: [ SearchResultsComponent ],
  exports: [ SearchResultsComponent ]
})
export class SearchResultsModule {}
