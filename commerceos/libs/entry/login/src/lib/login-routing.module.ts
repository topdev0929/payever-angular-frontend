import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CountryGuard, PartnerResolver } from '@pe/entry/shared';

import {
  LoginAsUserLayoutComponent,
  LoginRefreshLayoutComponent,
  PersonalLoginComponent,
  PluginLoginLayoutComponent,
  SocialReturnComponent,
} from './components';

const routes: Routes = [
  {
    path: '',
    component: PersonalLoginComponent,
    resolve: { partner: PartnerResolver },
  },
  {
    path: 'refresh',
    component: LoginRefreshLayoutComponent,
    resolve: { partner: PartnerResolver },
  },
  {
    path: 'social-login',
    component: SocialReturnComponent,
    resolve: { partner: PartnerResolver },
  },
  {
    path: 'as-user',
    component: LoginAsUserLayoutComponent,
    resolve: { partner: PartnerResolver },
  },
  {
    path: 'employees/:businessId',
    loadChildren: () => import('./components/employee-login').then(m => m.EmployeeLoginModule),
  },
  {
    path: ':industry',
    children: [
      {
        path: 'app/:app',
        component: PersonalLoginComponent,
        resolve: { partner: PartnerResolver },
        data: { type: 'business' },
      },
      {
        path: 'employees/:businessId',
        loadChildren: () => import('./components/employee-login').then(m => m.EmployeeLoginModule),
      },
      {
        path: ':plugin',
        component: PluginLoginLayoutComponent,
        resolve: { partner: PartnerResolver },
      },
      {
        path: ':country',
        data: { type: 'business' },
        canActivateChild: [CountryGuard],
        children: [
          {
            path: '',
            component: PersonalLoginComponent,
            resolve: { partner: PartnerResolver },
            data: { type: 'business' },
          },
          {
            path: ':app',
            children: [
              {
                path: '',
                component: PersonalLoginComponent,
                resolve: { partner: PartnerResolver },
                data: { type: 'business' },
              },
              {
                path: ':fragment',
                component: PersonalLoginComponent,
                resolve: { partner: PartnerResolver },
                data: { type: 'business' },
              },
            ],
          },
        ],
      },
      {
        path: '',
        component: PersonalLoginComponent,
        resolve: { partner: PartnerResolver },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginRoutingModule {}
