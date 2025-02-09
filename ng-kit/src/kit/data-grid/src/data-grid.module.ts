import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

import { I18nModule, TranslateService } from '../../i18n';
import { BrowserModule } from '../../browser';
import { ScrollEndDetectionModule } from '../../scroll-end-detection';
import { FormComponentsDatepickerModule } from '../../form-components/datepicker';

import {
  DataGridColumnSwitcherComponent,
  DataGridFilterTypeContainerComponent,
  DataGridFilterTypeDate,
  DataGridFilterTypeDefaultComponent,
  DataGridFilterTypeNumberComponent,
  DataGridFilterTypeSelectComponent,
  DataGridFiltersComponent,
  DataGridFiltersMenuComponent,
  DataGridLayoutComponent,
  DataGridPaginationComponent,
  DataGridSearchComponent,
  DataGridSelectBarComponent,
  DataGridToolbarComponent,
  DataGridViewSwitcherComponent,
} from './components';

import { PeMatPaginatorIntl } from './mat-paginator-intl';

let createPeMatPaginatorIntl = (translateService: TranslateService) => {
  return new PeMatPaginatorIntl(translateService);
};

// @dynamic
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule,
    BrowserModule,
    I18nModule.forChild(),
    ScrollEndDetectionModule,
    FormComponentsDatepickerModule
  ],
  declarations: [
    DataGridColumnSwitcherComponent,
    DataGridFilterTypeContainerComponent,
    DataGridFilterTypeDate,
    DataGridFilterTypeDefaultComponent,
    DataGridFilterTypeNumberComponent,
    DataGridFilterTypeSelectComponent,
    DataGridFiltersComponent,
    DataGridFiltersMenuComponent,
    DataGridLayoutComponent,
    DataGridPaginationComponent,
    DataGridSearchComponent,
    DataGridSelectBarComponent,
    DataGridToolbarComponent,
    DataGridViewSwitcherComponent,
  ],
  exports: [
    DataGridFilterTypeContainerComponent,
    DataGridFiltersComponent,
    DataGridFiltersMenuComponent,
    DataGridLayoutComponent,
    DataGridPaginationComponent,
    DataGridSearchComponent,
    DataGridSelectBarComponent,
    DataGridToolbarComponent,
  ],
  providers: [
    {
      provide: MatPaginatorIntl,
      useFactory: createPeMatPaginatorIntl,
      deps: [TranslateService],
    }
  ],
})
export class DataGridModule {}
