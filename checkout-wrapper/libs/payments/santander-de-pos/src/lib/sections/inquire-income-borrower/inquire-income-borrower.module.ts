import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PersonTypeEnum, PERSON_TYPE, IncomeService } from '@pe/checkout/santander-de-pos/shared';
import { IncomeModule } from '@pe/checkout/santander-de-pos/shared/income';
import { ContinueButtonModule } from '@pe/checkout/ui/continue-button';

import { InquireFormIncomeBorrowerComponent } from './components';

@NgModule({
  declarations: [
    InquireFormIncomeBorrowerComponent,
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
      useValue: PersonTypeEnum.Customer,
    },
  ],
})
export class InquireIncomeBorrowerModule {
  resolveComponent(): Type<InquireFormIncomeBorrowerComponent> {
    return InquireFormIncomeBorrowerComponent;
  }
}
