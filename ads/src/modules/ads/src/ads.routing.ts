import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PebAdsComponent } from './routes/_root/ads-root.component';
import { PebCampaignsComponent } from './routes/campaigns/campaigns.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'campaigns'
  },
  {
    path: '',
    component: PebAdsComponent,
    children: [
      {
        path: 'campaigns',
        component: PebCampaignsComponent,
      },
    ],
  },
];

export const RouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
})
export class PebAdsRouteModule {}
