import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { FinishModule } from '@pe/checkout/finish';
import { UtilsModule } from '@pe/checkout/utils';

import {
  FlowCommonFinishStaticSuccessComponent,
  FlowCommonFinishStaticFailComponent,
  FlowCommonFinishStaticCancelComponent,
  FlowSantanderDePosFinishStaticSuccessComponent,
} from './components';
import { RoutingModule } from './routing.module';



@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,

    FinishModule,
    UtilsModule,
    RoutingModule,
  ],
  declarations: [
    FlowCommonFinishStaticSuccessComponent,
    FlowCommonFinishStaticFailComponent,
    FlowCommonFinishStaticCancelComponent,
    FlowSantanderDePosFinishStaticSuccessComponent,
  ],
  providers: [
  ],
})
export class StaticFinishModule {
}
