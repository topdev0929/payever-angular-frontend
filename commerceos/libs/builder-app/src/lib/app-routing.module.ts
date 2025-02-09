import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeBuilderAppComponent } from './app.component';
import { PeBuilderAppGuard } from './app.guard';


export const routes: Routes = [
  {
    path: '',
    canActivate: [PeBuilderAppGuard],
    component: PeBuilderAppComponent,
    children: [
      {
        path: ':app',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'settings',
          },
          {
            path: '',
            loadChildren: () => import('./header/header.module').then(m => m.PeBuilderAppHeaderModule),
            outlet: 'header',
          },
          {
            path: '',
            loadChildren: () => import('./nav/nav.module').then(m => m.PeBuilderAppNavModule),
            outlet: 'nav',
          },
          {
            path: 'dashboard',
            loadChildren: () => import('./main/dashboard/dashboard.module').then(m => m.PeDashboardModule),
          },
          {
            path: 'edit',
            loadChildren: () => import('@pe/builder/main-editor').then(m => m.PebMainEditorModule),
          },
          {
            path: 'settings',
            loadChildren: () => import('./main/settings/settings.module').then(m => m.PeSettingsModule),
          },
          {
            path: 'themes',
            loadChildren: () => import('@pe/themes').then(m => m.PebThemesModule),
          },
        ],
      },
    ],
  },
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class PeBuilderAppRoutingModule {
}
