import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DockerGuard } from '@pe/docker';
import { ActivateUserLangGuard, TranslationGuard } from '@pe/i18n';
import { EmployeeGuard } from '@pe/shared/business';

import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'info/overview',
  },
  {
    path: '',
    component: DashboardComponent,
    canActivate: [TranslationGuard],
    data: {
      i18nDomains: ['commerceos-app', 'commerceos-ui-feature'],
    },
    children: [
      {
        path: 'info/overview',
        canActivate: [TranslationGuard, DockerGuard],
        loadChildren: () => import('@pe/dashboard-widgets').then(m => m.DashboardWidgetsModule),
        data: {
          i18nDomains: ['commerceos-app', 'commerceos-widgets-app','commerceos-welcome-app'],
        },
      },
    ],
  },
  {
    path: 'affiliates',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/affiliates').then(m => m.PeAffiliatesModule),
    data: {
      i18nDomains: ['commerceos-welcome-app'],
      app: {
        name: 'Affiliates',
        icon: '#icon-apps-affiliates',
      },
    },
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
  },
  {
    path: 'appointments',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/appointments').then(m => m.PeAppointmentsModule),
    data: {
      i18nDomains: ['commerceos-welcome-app'],
      app: {
        name: 'Appointments',
        icon: '#icon-apps-appointments',
      },
    },
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
  },
  {
    path: 'transactions',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/transactions').then(m => m.AppsTransactionsModule),
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
    data: {
      i18nDomains: [
        'commerceos-transactions-integration',
        'commerceos-transactions-app',
        'commerceos-transactions-values-app',
        'commerceos-rules-app',
        'commerceos-folders-app',
      ],
      app: {
        name: 'Transactions',
        icon: '#icon-apps-orders',
      },
    },
  },
  {
    path: 'blog',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/blog').then(m => m.PeBlogModule),//
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
    data: {
      i18nDomains: [
        'commerceos-blog-app',
        'commerceos-folders-app',
        'commerceos-grid-app',
        'commerceos-media-app',
        'commerceos-themes-app',
        'commerceos-welcome-app',
        'commerceos-ui-feature',
      ],
      app: {
        name: 'Blogs',
        icon: '#icon-apps-blogs',
      },
    },
  },
  {
    path: 'settings',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/settings').then(m => m.CosNextSettingsModule),
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
    data: {
      i18nDomains: [
        'commerceos-welcome-app',
        'commerceos-ui-feature' ,
        'commerceos-grid-app',
        'commerceos-transactions-app',
        'commerceos-settings-employees-acls',
      ],
      app: {
        name: 'Settings',
        icon: '#icon-apps-settings',
      },
    },
  },
  {
    path: 'shipping',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/shipping').then(m => m.CosShippingModule),
    data: {
      i18nDomains: [
        'commerceos-welcome-app', 'commerceos-shipping-app', 'commerceos-ui-feature' ,'commerceos-grid-app',
      ],
    },
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
  },
  {
    path: 'shop',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/shop').then(m => m.PeShopModule),
    data: {
      i18nDomains: [
        'commerceos-folders-app',
        'commerceos-grid-app',
        'commerceos-media-app',
        'commerceos-themes-app',
        'commerceos-welcome-app',
        'commerceos-shop-app',
        'commerceos-ui-feature',
      ],
    },
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
  },
  {
    path: 'message',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/message').then(m => m.CosMessageModule),
    data: {
      i18nDomains: [
        'commerceos-welcome-app',
        'commerceos-rules-app',
        'commerceos-themes-app',
        'commerceos-message-app',
        'commerceos-transactions-app',
        'commerceos-grid-app',
        'commerceos-products-list-app',
        'commerceos-products-editor-app',
        'commerceos-ui-feature',
      ],
    },
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
  },
  {
    path: 'site',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/site').then(m => m.PeSiteModule),
    data: {
      i18nDomains: [
        'commerceos-folders-app',
        'commerceos-grid-app',
        'commerceos-media-app',
        'commerceos-site-app',
        'commerceos-themes-app',
        'commerceos-welcome-app',
        'commerceos-ui-feature',
      ],
    },
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
  },
  {
    path: 'subscriptions',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/subscriptions').then(m => m.PeSubscriptionsModule),
    data: {
      i18nDomains: ['commerceos-welcome-app'],
    },
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
  },
  {
    path: 'connect',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/connect').then(m => m.CosConnectModule),
    data: {
      i18nDomains: ['commerceos-welcome-app', 'commerceos-connect-business-form'],
    },
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
  },
  {
    path: 'pos',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/pos').then(m => m.CosNextPosModule),
    data: {
      i18nDomains: ['commerceos-welcome-app', 'commerceos-pos-app'],
    },
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
  },
  {
    path: 'contacts',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/contacts').then(m => m.CosContactsModule),
    data: {
      i18nDomains: [
        'commerceos-contacts-app',
        'commerceos-folders-app',
        'commerceos-grid-app',
        'commerceos-media-app',
        'commerceos-rules-app',
        'commerceos-welcome-app',
      ],
    },
    canActivate: [DockerGuard, TranslationGuard, EmployeeGuard],
  },
  {
    path: 'coupons',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/coupons').then(m => m.CosCouponsModule),
    data: {
      i18nDomains: [
        'commerceos-coupons-app',
        'commerceos-folders-app',
        'commerceos-grid-app',
        'commerceos-media-app',
        'commerceos-welcome-app',
      ],
    },
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
  },
  {
    path: 'products',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/products').then(m => m.CosProductsModule),
    data: {
      i18nDomains: [
        'commerceos-welcome-app',
        'commerceos-rules-app',
        'commerceos-products-values-app',
        'commerceos-products-list-app',
      ],
    },
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
  },
  {
    path: 'studio',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/studio').then(m => m.CosNextStudioModule),
    data: {
      i18nDomains: ['commerceos-welcome-app', 'commerceos-studio-app', 'commerceos-grid-app'],
    },
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
  },
  {
    path: 'invoice',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/invoice').then(m => m.CosNextInvoiceModule),
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
    data: {
      i18nDomains: ['commerceos-welcome-app', 'commerceos-invoice-app'],
      app: {
        name: 'Invoices',
        icon: '#icon-apps-invoice',
      },
    },
  },
  {
    path: 'statistics',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/statistics').then(m => m.CosNextStatisticsModule),
    data: {
      i18nDomains: ['commerceos-welcome-app'],
    },
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
  },
  {
    path: 'social',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/social').then(m => m.CosSocialModule),
    data: {
      i18nDomains: [
        'commerceos-folders-app',
        'commerceos-grid-app',
        'commerceos-media-app',
        'commerceos-social-app',
        'commerceos-welcome-app',
      ],
    },
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
  },
  {
    path: 'checkout',
    // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
    loadChildren: () => import('@pe/apps/checkout').then(m => m.CosCheckoutModule),
    data: {
      i18nDomains: ['commerceos-welcome-app'],
    },
    canActivate: [TranslationGuard, DockerGuard, EmployeeGuard],
  },
  {
    path: 'welcome/transactions',
    loadChildren: () => import('@pe/micro-container').then(m => m.MicroContainerModule),
    canActivate: [
      ActivateUserLangGuard,
      TranslationGuard,
      DockerGuard,
    ],
    data: {
      i18nDomains: ['commerceos-welcome-app'],
      isWelcome: true,
      app: {
        name: 'Transactions',
        icon: '#icon-apps-orders',
      },
    },
  },
  {
    path: 'welcome/settings',
    loadChildren: () => import('@pe/micro-container').then(m => m.MicroContainerModule),
    canActivate: [
      ActivateUserLangGuard,
      TranslationGuard,
      DockerGuard,
    ],
    data: {
      i18nDomains: ['commerceos-welcome-app'],
      isWelcome: true,
      app: {
        name: 'Settings',
        icon: '#icon-apps-settings',
      },
    },
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
