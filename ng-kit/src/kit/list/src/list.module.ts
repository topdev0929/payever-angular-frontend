import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';

import {
  ListComponent,
  ListItemComponent,
  ListOptionComponent,
  NavListComponent,
  SelectionListComponent
} from './components';

@NgModule({
  imports: [
    CommonModule,
    MatListModule
  ],
  declarations: [
    ListComponent,
    ListItemComponent,
    ListOptionComponent,
    NavListComponent,
    SelectionListComponent
  ],
  entryComponents: [
    ListComponent
  ],
  exports: [
    MatListModule,
    ListComponent,
    ListItemComponent,
    ListOptionComponent,
    NavListComponent,
    SelectionListComponent
  ]
})
export class ListModule {}
