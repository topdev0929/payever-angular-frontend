import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeConnectListComponent } from './routes/connect/connect-list/connect-list.component';
import { PeProgramsComponent } from './routes/programs/components/programs-list/programs.component';
import { PeSettingsComponent } from './routes/settings/settings.component';
import { PeThemesComponent } from './routes/themes/themes.component';
import { PebSubscriptionDashboardComponent } from './routes/dashboard/subscription-dashboard.component';
import { PeSubscriptionsComponent } from './subscriptions.component';
import { PeSubscriptionGuard } from './guards/subscription.guard';
import { PebSubscriptionEditorRouteModule } from './routes/editor/subscription-editor.module';
import { SubscriptionThemeGuard } from './guards/theme.guard';

export function subscriptionEditorRoute() {
  return PebSubscriptionEditorRouteModule;
}

const routes: Routes = [
  {
    path: '',
    component: PeSubscriptionsComponent,
    canActivate: [PeSubscriptionGuard],
    children: [
      {
        path: ':applicationId',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard',
          },
          {
            path: 'dashboard',
            component: PebSubscriptionDashboardComponent,
            canActivate: [SubscriptionThemeGuard],
          },
          {
            path: 'programs',
            component: PeProgramsComponent,
          },
          {
            path: 'connect',
            component: PeConnectListComponent,
          },
          {
            path: 'edit',
            loadChildren: subscriptionEditorRoute,
          },
          {
            path: 'settings',
            component: PeSettingsComponent,

          },
          {
            path: 'themes',
            component: PeThemesComponent,
          },
          {
            path: 'builder/:themeId/edit',
            loadChildren: subscriptionEditorRoute,
          },
        ],
      },
    ],
  },
];

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const RouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
  providers: [SubscriptionThemeGuard],
})
export class PesRouteModule {}
