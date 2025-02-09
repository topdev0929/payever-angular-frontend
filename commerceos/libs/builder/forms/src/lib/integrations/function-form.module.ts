import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PebItemBarModule } from '@pe/builder/form-controls';
import { I18nModule } from '@pe/i18n';

import { PebFieldSelectorComponent } from './field-selector/field-selector.component';
import { PebFunctionFormComponent } from './function-form.component';
import { PebIntegrationFormComponent } from './integration-form/integration-form.component';
import { PebIntegrationListComponent } from './integration-list/integration-list.component';


@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    I18nModule,
    PebItemBarModule,
  ],
  declarations: [
    PebFunctionFormComponent,
    PebIntegrationFormComponent,
    PebIntegrationListComponent,
    PebFieldSelectorComponent,
  ],
  exports: [
    PebFunctionFormComponent,
    PebIntegrationFormComponent,
    PebIntegrationListComponent,
    PebFieldSelectorComponent,
  ],
})
export class PebFunctionFormModule {
}
