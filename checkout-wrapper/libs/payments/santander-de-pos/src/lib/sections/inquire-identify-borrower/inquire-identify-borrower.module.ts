import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {
  DocsManagerService,
  PersonTypeEnum,
  PERSON_TYPE,
  SantanderDePosApiService,
  SantanderDePosFlowService,
  docsManagerServiceFactory,
} from '@pe/checkout/santander-de-pos/shared';
import { IdentifyModule } from '@pe/checkout/santander-de-pos/shared/identify';

import { InquireFormIdentifyBorrowerComponent } from './components';

@NgModule({
  declarations: [
    InquireFormIdentifyBorrowerComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IdentifyModule,
  ],
  providers: [
    SantanderDePosApiService,
    SantanderDePosFlowService,
    {
      provide: DocsManagerService,
      useFactory: docsManagerServiceFactory,
    },
    {
      provide: PERSON_TYPE,
      useValue: PersonTypeEnum.Customer,
    },
  ],
})
export class InquireIdentifyBorrowerModule {
  resolveComponent(): Type<InquireFormIdentifyBorrowerComponent> {
    return InquireFormIdentifyBorrowerComponent;
  }
}
