import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccountType } from '@pe/entry/personal-form';
import { CountryGuard, PartnerResolver } from '@pe/entry/shared';

import { PluginOnboardingComponent } from './plugin-onboarding.component';
import { RegistrationComponent } from './registration.component';
import { BusinessRegistrationResolver } from './resolvers';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'business',
  },
  {
    path: 'personal',
    component: RegistrationComponent,
    data: { type: AccountType.personal },
    resolve: { partner: PartnerResolver },
  },
  {
    path: 'employees/:businessId',
    loadChildren: () => import('./employee').then(m => m.RegistrationEmployeeModule),
  },
  {
    path: 'business',
    loadChildren: () => import('./business').then(m => m.RegistrationBusinessModule),
  },
  {
    path: ':industry',
    resolve: {
      businessRegistrationData: BusinessRegistrationResolver,
    },
    children: [
      {
        path: 'employees/:businessId',
        loadChildren: () => import('./employee').then(m => m.RegistrationEmployeeModule),
      },
      {
        path: 'app/:app',
        component: RegistrationComponent,
        data: { type: AccountType.business },
        resolve: { partner: PartnerResolver },
      },
      {
        path: ':plugin',
        children: [
          {
            path: '',
            component: PluginOnboardingComponent,
            data: { type: AccountType.business },
            resolve: { partner: PartnerResolver },
          },
          {
            path: 'social',
            component: PluginOnboardingComponent,
            data: { type: AccountType.business, isSocial: true },
            resolve: { partner: PartnerResolver },
          },
        ],
      },

      {
        path: ':country',
        data: { type: AccountType.business },
        canActivateChild: [CountryGuard],
        children: [
          {
            path: '',
            component: RegistrationComponent,
            data: { type: AccountType.business },
            resolve: { partner: PartnerResolver },
          },
          {
            path: ':fragment',
            component: RegistrationComponent,
            data: { type: AccountType.business },
            resolve: { partner: PartnerResolver },
          },
          {
            path: ':app',
            children: [
              {
                path: ':fragment',
                component: RegistrationComponent,
                data: { type: AccountType.business },
                resolve: { partner: PartnerResolver },
              },
            ],
          },
        ],
      },
      {
        path: '',
        component: RegistrationComponent,
        data: { type: AccountType.business },
        resolve: { partner: PartnerResolver },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrationRoutingModule { }
