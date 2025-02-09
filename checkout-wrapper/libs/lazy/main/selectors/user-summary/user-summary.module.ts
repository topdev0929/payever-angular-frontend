import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { AbstractSelectorModule } from '@pe/checkout/main/selectors';

import { UserSummaryComponent } from './user-summary.component';

@NgModule({
  declarations: [
    UserSummaryComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    UserSummaryComponent,
  ],
})
export class UserSummaryModuleMain extends AbstractSelectorModule {
  resolveComponent(): Type<UserSummaryComponent> {
    return UserSummaryComponent;
  }
}
