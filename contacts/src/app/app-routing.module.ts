import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BusinessDataResolver } from './modules/services/business-data.resolver';
import { CommonService } from './modules/services/common.service';

const appRoutes: Routes = [
  {
    path: 'business/:businessUuid',
    resolve: {
      checkoutData: CommonService,
    },
    children: [
      {
        path: 'contacts',
        loadChildren: () => import('../app/modules/contacts/src/contacts.module').then(m => m.ContactsModule),
        data: {
          businessMode: true // todo: delete if deprecated
        },
        resolve: {
          businessData: BusinessDataResolver,
        },
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
