import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PeDataGridModule } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import { I18nModule, TranslationGuard } from '@pe/i18n';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';

import { PebMediaStylesComponent } from './media-styles.component';
import { PebMediaComponent } from './media.component';

const routes = [
  {
    path: '',
    component: PebMediaComponent,
    canActivate: [TranslationGuard],
    data: {
      i18nDomains: ['commerceos-studio-app', 'data-grid-app'],
      isFromDashboard: true,
    },
    children: [
      {
        path: '',
        // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
        loadChildren: () => import('@pe/apps/studio').then(m => m.PeStudioModule),
      },
    ],
  },
];


@NgModule({
  declarations: [PebMediaComponent, PebMediaStylesComponent],
  imports: [
    CommonModule,
    PeDataGridModule,
    PeFiltersModule,
    PePlatformHeaderModule,
    PeSidebarModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    I18nModule,
  ],
  exports: [
    PeDataGridModule,
    PeFiltersModule,
    PeSidebarModule,
  ],
})
export class PebMediaModule { }
