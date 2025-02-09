import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { RouterModule, Routes } from '@angular/router';

import { PeFiltersModule } from '@pe/filters';
import { I18nModule } from '@pe/i18n';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';
import { PebMessagesModule } from '@pe/ui';

import { PeBuilderEditorComponent } from './builder-editor.component';
import { PeBuilderHeaderMenuComponent } from './builder-menu';
import { PeBuilderHeaderMenuStylesComponent } from './builder-menu-styles';

const routes: Routes = [{
  path: '',
  component: PeBuilderEditorComponent,
}];

const angularModules = [
  CommonModule,
  MatButtonModule,
  MatChipsModule,
  MatFormFieldModule,
  MatIconModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  ReactiveFormsModule,
  RouterModule.forChild(routes),
];

const peModules = [
  I18nModule,
  PebMessagesModule,
  PeFiltersModule,
  PePlatformHeaderModule,
  PeSidebarModule,
];

@NgModule({
  imports: [
    ...angularModules,
    ...peModules,
  ],
  declarations: [
    PeBuilderEditorComponent,
    PeBuilderHeaderMenuComponent,
    PeBuilderHeaderMenuStylesComponent,
  ],
  providers: [
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 2500 },
    },
  ],
})
export class PeBuilderEditorModule {
}
