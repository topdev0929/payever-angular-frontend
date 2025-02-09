import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';

import { DataGridDocComponent } from './data-grid-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import {
  DataGridExampleDocComponent
} from './examples';

import { DataGridModule } from '../../../../kit/data-grid';
import { GridModule } from '../../../../kit/grid';
import { TableModule } from '../../../../kit/table';

@NgModule({
  imports: [
    DocComponentSharedModule,
    DataGridModule,

    GridModule,
    TableModule,

    MatCheckboxModule,
    MatSortModule
  ],
  declarations: [
    DataGridDocComponent,
    DataGridExampleDocComponent
  ],
  exports: [
    DataGridDocComponent
  ]
})
export class DataGridDocModule {
}
