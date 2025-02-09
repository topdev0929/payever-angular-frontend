import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxMaskModule, IConfig } from 'ngx-mask';

import { FormModule } from '@pe/forms';
import { PeAuthCodeModule, PebButtonModule, PebCheckboxModule, PebFormFieldInputModule } from '@pe/ui';

import { ApiService } from '../../../../services/api.service';
import { SharedModule } from '../../../../shared';

import { ActionVerifyByIdComponent } from './by-id/verify-by-id.component';
import { ActionVerifyDigitCodeComponent } from './digit-code/digit-code.component';
import { ActionVerifyFieldsComponent } from './fields/fields.component';
import { ActionVerifySimpleComponent } from './simple/simple.component';
import { ActionVerifyComponent } from './verify.component';
import { VerifyService } from './verify.service';


const maskConfig: Partial<IConfig> = {
  validation: false,
};

const routes: Routes = [
  {
    path: ':uuid',
    component: ActionVerifyComponent,
    children: [
      {
        path: 'by-id',
        component: ActionVerifyByIdComponent,
      },
      {
        path: 'code',
        component: ActionVerifyDigitCodeComponent,
      },
      {
        path: 'simple',
        component: ActionVerifySimpleComponent,
      },
    ],
  },
];


@NgModule({
  declarations: [
    ActionVerifyComponent,
    ActionVerifyByIdComponent,
    ActionVerifySimpleComponent,
    ActionVerifyDigitCodeComponent,
    ActionVerifyFieldsComponent,
  ],
  imports: [
    CommonModule,
    FormModule,
    RouterModule.forChild(routes),
    SharedModule,
    PebFormFieldInputModule,
    PebButtonModule,
    PebCheckboxModule,
    NgxMaskModule.forRoot(maskConfig),
    PeAuthCodeModule,
  ],
  providers: [
    ApiService,
    VerifyService,
  ],
})

export class ActionsVerifyModule {}
