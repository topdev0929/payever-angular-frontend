import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { PebAnimationModule } from '@pe/builder/animations';
import { PebDirectivesModule } from '@pe/builder/directives';
import { PebAutoHideScrollbarModule } from '@pe/builder/editor-utils';
import { PebRendererModule } from '@pe/builder/renderer';
import { I18nModule } from '@pe/i18n';

import { PeDashboardComponent } from './dashboard.component';
import { PeScreenSelectorComponent } from './screen-selector/screen-selector.component';


@NgModule({
  imports: [
    CommonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    RouterModule.forChild([{
      path: '',
      component: PeDashboardComponent,
    }]),
    I18nModule.forRoot(),
    PebRendererModule,
    PebDirectivesModule,
    PebAutoHideScrollbarModule,
    MatIconModule,
    PebAnimationModule,
  ],
  declarations: [
    PeDashboardComponent,
    PeScreenSelectorComponent,
  ],
  exports: [
    PeDashboardComponent,
  ],  
})
export class PeBuilderAppDashboardModule {
}
