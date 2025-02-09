import { CommonModule } from '@angular/common';
import { Type, Injector, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  FormUtilsModule,
  LAZY_PAYMENT_SECTIONS,
} from '@pe/checkout/form-utils';
import { BasePaymentEditModule } from '@pe/checkout/payment';
import {
  SharedModule,
  LAZY_PAYMENT_SECTIONS_DE_POS,
  RatesCalculationService,
  ratesCalculationServiceFactory,
  RatesCalculationApiService,
  CustomerTypeDirective,
  GuarantorTypeDirective,
  IncomeService,
} from '@pe/checkout/santander-de-pos/shared';
import { AddressFormComponent } from '@pe/checkout/sections/address-edit';

import { IdentifyModule, IncomeModule, PersonalModule, RateModule } from '../shared/sections';

import { EditContainerComponent } from './edit-container.component';
import { EditFormComponent, EditFormService } from './form';

@NgModule({
  imports: [
    CommonModule,
    FormUtilsModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    AddressFormComponent,

    RateModule,
    IdentifyModule,
    PersonalModule,
    IncomeModule,
  ],
  exports: [
    EditContainerComponent,
  ],
  declarations: [
    EditContainerComponent,
    EditFormComponent,
    CustomerTypeDirective,
    GuarantorTypeDirective,
  ],
  providers: [
    {
      provide: LAZY_PAYMENT_SECTIONS,
      useValue: LAZY_PAYMENT_SECTIONS_DE_POS,
    },
    { provide: RatesCalculationService, useFactory: ratesCalculationServiceFactory, deps: [Injector] },
    RatesCalculationApiService,
    IncomeService,
    EditFormService,
  ],
})
export class SantanderDePosEditModule extends BasePaymentEditModule {

  public resolveEditContainerComponent(): Type<EditContainerComponent> {
    return EditContainerComponent;
  }
}
