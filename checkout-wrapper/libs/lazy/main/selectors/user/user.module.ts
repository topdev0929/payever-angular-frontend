import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { AbstractSelectorModule } from '@pe/checkout/main/selectors';
import { UiModule } from '@pe/checkout/ui';


import {
  UserCheckComponent,
  UserLoginComponent,
} from './components';
import { UserComponent } from './user.component';


@NgModule({
  declarations: [
    UserComponent,
    UserCheckComponent,
    UserLoginComponent,
  ],
  imports: [
    CommonModule,
    UiModule,
  ],
  exports: [
    UserComponent,
  ],
})
export class UserModuleMain extends AbstractSelectorModule {
  resolveComponent(): Type<UserComponent> {
    return UserComponent;
  }
}
