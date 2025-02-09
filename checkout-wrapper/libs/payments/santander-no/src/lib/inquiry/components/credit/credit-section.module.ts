import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { ContinueButtonModule } from '@pe/checkout/ui/continue-button';

import { CreditFormComponent } from './_form';
import { CreditZStatusComponent } from './credit-z-status';

@NgModule({
  declarations: [
    CreditFormComponent,
    CreditZStatusComponent,
  ],
  imports: [CommonModule, ContinueButtonModule],
})
export class CreditSectionModule {
  resolveComponent(): Type<CreditFormComponent> {
    return CreditFormComponent;
  }
}
