import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: 'pay/create-flow',
    loadChildren: () =>
      import('./modules/create-flow/create-flow.module')
        .then(m => m.CheckoutCreateFlowModule),
  },
  {
    path: 'pay/create-flow-from-qr',
    loadChildren: () =>
      import('./modules/create-flow-from-qr/create-flow-from-qr.module')
        .then(m => m.CheckoutCreateFlowFromQrModule),
  },
  {
    path: 'pay/restore-flow-from-code',
    loadChildren: () =>
      import('./modules/restore-flow-from-code/restore-flow-from-code.module')
        .then(m => m.RestoreFlowFromCodeModule),
  },
  {
    path: 'pay/restore-flow-from-payment-code',
    loadChildren: () =>
      import('./modules/restore-flow-from-payment-code/restore-flow-from-payment-code.module')
        .then(m => m.RestoreFlowFromPaymentCodeModule),
  },
  {
    path: 'pay/api-call',
    loadChildren: () =>
      import('./modules/create-flow-from-api-call/create-flow-from-api-call.module')
        .then(m => m.CheckoutCreateFlowFromApiCallModule),
  },
  {
    path: 'pay/widget',
    loadChildren: () =>
      import('./modules/widget/widget-view.module')
        .then(m => m.WidgetViewModule),
  },
  {
    path: '',
    loadChildren: () =>
      import('./modules/pages/pages.module')
        .then(m => m.CheckoutPagesModule),
  },
];
