import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PebConnectComponent } from './routes/connect/connect.component';
import { PebDeliveryByLocationComponent } from './routes/delivery-by-location/delivery-by-location.component';
import { PebPackagingSlipComponent } from './routes/packaging-slip/packaging-slip.component';
import { PebPickupByLocationComponent } from './routes/pickup-by-location/pickup-by-location.component';
import { PebShippingComponent } from './routes/root/shipping.component';
import { PebShippingOptionsComponent } from './routes/shipping-options/shipping-options.component';
import { PebBoxesComponent } from './routes/shipping-packages/boxes/boxes.component';
import { PebEnvelopesComponent } from './routes/shipping-packages/envelopes/envelopes.component';
import { PebShippingPackagesComponent } from './routes/shipping-packages/shipping-packages.component';
import { PebSoftPackageComponent } from './routes/shipping-packages/soft-package/soft-package.component';
import { PebShippingProfilesComponent } from './routes/shipping-profiles/shipping-profiles.component';

const routes: Routes = [
  {
    path: '',
    component: PebShippingComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'profiles' },
      { path: 'profiles', component: PebShippingProfilesComponent },
      { path: 'zones', component: PebShippingOptionsComponent },
      {
        path: 'packages',
        component: PebShippingPackagesComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'envelopes' },
          { path: 'envelopes', component: PebEnvelopesComponent },
          { path: 'boxes', component: PebBoxesComponent },
          { path: 'soft-packages', component: PebSoftPackageComponent },
        ],
      },
      {
        path: 'delivery-by-location',
        component: PebDeliveryByLocationComponent,
      },
      { path: 'pickup-by-location', component: PebPickupByLocationComponent },
      { path: 'packaging-slip', component: PebPackagingSlipComponent },
      { path: 'connect', component: PebConnectComponent },
    ],
  },
];

export const RouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
})
export class PebShippingRouteModule {}
