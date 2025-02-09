import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { CdkTableModule } from '@angular/cdk/table';

import { TableComponent, TableFooterRowComponent, TableHeaderRowComponent, TableRowComponent } from './components';
import {
  TableCellDefDirective,
  TableCellDirective,
  TableColumnDefDirective,
  TableFooterCellDefDirective,
  TableFooterCellDirective,
  TableFooterRowDefDirective,
  TableHeaderCellDefDirective,
  TableHeaderCellDirective,
  TableHeaderRowDefDirective,
  TableRowDefDirective
} from './directives';

const EXPORTED_DECLARATIONS: any[] = [
  TableComponent,

  TableHeaderCellDefDirective,
  TableHeaderRowDefDirective,
  TableColumnDefDirective,
  TableCellDefDirective,
  TableRowDefDirective,
  TableFooterCellDefDirective,
  TableFooterRowDefDirective,

  TableHeaderCellDirective,
  TableCellDirective,
  TableFooterCellDirective,

  TableHeaderRowComponent,
  TableRowComponent,
  TableFooterRowComponent
];

@NgModule({
  imports: [
    MatTableModule,
    CdkTableModule,
    CommonModule,
    PlatformModule
  ],
  declarations: [EXPORTED_DECLARATIONS],
  exports: [EXPORTED_DECLARATIONS, CdkTableModule]
})
export class TableModule {

}
