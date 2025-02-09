import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PebDashboardComponent } from './routes/dashboard/dashboard.component';
import { PebSettingsComponent } from './routes/settings/settings.component';
import { PebAffiliatesComponent } from './routes/root/affiliates-root.component';
import { PebProgramsComponent } from './routes/programs/programs.component';

const routes: Routes = [
  {
    path: '',
    component: PebAffiliatesComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        component: PebDashboardComponent,
      },
      {
        path: 'programs',
        component: PebProgramsComponent,
      },
      { path: 'settings', component: PebSettingsComponent },
    ],
  },
];

export const RouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
})
export class PebAffiliatesRouteModule {}
