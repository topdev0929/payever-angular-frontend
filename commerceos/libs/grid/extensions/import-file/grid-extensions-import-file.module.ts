import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { I18nModule } from '@pe/i18n';

import { ImportFileComponent, ImportMenuComponent, ImportMenuStyleComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    FormsModule,
    I18nModule.forChild(),
  ],
  declarations: [
    ImportFileComponent,
    ImportMenuComponent,
    ImportMenuStyleComponent,
  ],
  exports: [
    ImportFileComponent,
  ],
})
export class GridExtensionsImportFileModule {}
