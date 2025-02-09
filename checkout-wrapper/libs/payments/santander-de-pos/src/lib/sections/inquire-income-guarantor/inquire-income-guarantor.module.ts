import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PersonTypeEnum, PERSON_TYPE, IncomeService } from '@pe/checkout/santander-de-pos/shared';
import { IncomeModule } from '@pe/checkout/santander-de-pos/shared/income';
import { ContinueButtonModule } from '@pe/checkout/ui/continue-button';

import { InquireIncomeGuarantorComponent } from './components';

@NgModule({
  declarations: [
    InquireIncomeGuarantorComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IncomeModule,
    ContinueButtonModule,
  ],
  providers: [
    IncomeService,
    {
      provide: PERSON_TYPE,
      useValue: PersonTypeEnum.Guarantor,
    },
  ],
})
export class InquireIncomeGuarantorModule {
  resolveComponent(): Type<InquireIncomeGuarantorComponent> {
    return InquireIncomeGuarantorComponent;
  }
}
