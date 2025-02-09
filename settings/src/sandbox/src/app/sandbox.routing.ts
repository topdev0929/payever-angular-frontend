import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { settingsBusinessIdRouteParam, SettingsRootRoutesEnum } from '@pe/settings';
import { SandboxFrontRouteComponent } from './root/front.route';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: SandboxFrontRouteComponent,
  },
  {
    path: `settings/${SettingsRootRoutesEnum.Business}/:${settingsBusinessIdRouteParam}/settings`,
    loadChildren: () => import('@pe/settings').then(
      m => m.SettingsModule,
    ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false,
    }),
  ],
  exports: [
    RouterModule,
  ],
})
export class SandboxRouting { }
