import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TemporarySecondFactorJustPassedOnlyGuard } from '@pe/ng-kit/modules/auth';
import { MicroLoaderGuard } from '@pe/ng-kit/modules/micro';

import {
  ActionAuthorizeComponent,
  ActionCancelComponent,
  ActionCaptureComponent,
  ActionChangeAmountComponent,
  ActionChangeReferenceComponent,
  ActionCreditAnswerComponent,
  ActionEditComponent,
  ActionPaidComponent,
  ActionRefundComponent,
  ActionRemindComponent,
  ActionShippingGoodsComponent,
  ActionVerifyComponent,
  ActionUpdateComponent,
  ActionUploadComponent,
  ActionVoidComponent,

  DetailsContainerComponent,
  ActionDownloadSlipComponent
} from './components';
import { ENABLE_2FA } from '../shared';

const routes: Routes = [
  {
    path: '',
    component: DetailsContainerComponent
  },
  {
    path: 'action',
    children: [
      {
        path: 'authorize',
        component: ActionAuthorizeComponent,
        data: {
          action: 'authorize'
        }
      },
      {
        path: 'cancel',
        component: ActionCancelComponent,
        data: {
          action: 'cancel'
        }
      },
      {
        path: 'capture',
        component: ActionCaptureComponent,
        data: {
          action: 'capture'
        }
      },
      {
        path: 'change_amount',
        component: ActionChangeAmountComponent,
        data: {
          action: 'change_amount',
          showFieldAmount: true
        }
      },
      {
        path: 'change_reference',
        component: ActionChangeReferenceComponent,
        data: {
          action: 'change_reference',
          showFieldReference: true
        }
      },
      {
        path: 'credit_answer',
        component: ActionCreditAnswerComponent,
        data: {
          action: 'credit_answer'
        }
      },
      {
        path: 'edit',
        component: ActionEditComponent,
        canActivate: ENABLE_2FA ? [
          TemporarySecondFactorJustPassedOnlyGuard,
          MicroLoaderGuard
        ] : [
          MicroLoaderGuard
        ],
        data: {
          action: 'edit',
          dependencies: {
            micros: ['paymentOptionsSantanderDe'] // For POS DE
          }
        }
      },
      {
        path: 'paid',
        component: ActionPaidComponent,
        data: {
          action: 'paid'
        }
      },
      {
        path: 'refund',
        component: ActionRefundComponent,
        data: {
          action: 'refund'
        }
      },
      {
        path: 'return',
        component: ActionRefundComponent,
        data: {
          action: 'return'
        }
      },
      {
        path: 'remind',
        component: ActionRemindComponent,
        data: {
          action: 'remind'
        }
      },
      {
        path: 'shipping_goods',
        component: ActionShippingGoodsComponent,
        data: {
          action: 'shipping_goods'
        }
      },
      {
        path: 'verify',
        component: ActionVerifyComponent,
        data: {
          action: 'verify'
        }
      },
      {
        path: 'update',
        component: ActionUpdateComponent,
        data: {
          action: 'edit'
        }
      },
      {
        path: 'upload',
        component: ActionUploadComponent,
        data: {
          action: 'upload'
        }
      },
      {
        path: ':shippingOrderId/download_shipping_slip',
        component: ActionDownloadSlipComponent,
      },
      {
        path: 'void',
        component: ActionVoidComponent,
        data: {
          action: 'void'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoutingModule {}
