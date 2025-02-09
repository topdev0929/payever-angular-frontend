import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { CouponsModule } from '@pe/checkout/coupons';
import { UiModule } from '@pe/checkout/ui';
import { UtilsModule } from '@pe/checkout/utils';

import { CouponsEditContainerComponent } from './components';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,

    UtilsModule,
    UiModule,

    CouponsModule,
  ],
  declarations: [
    CouponsEditContainerComponent,
  ],
  providers: [
    {
      provide: ANALYTICS_FORM_SETTINGS,
      useValue: {
        formName: 'FORM_COUPON_EDIT',
      },
    },
  ],
})
export class CouponsEditModule {
  resolveCouponsEditContainerComponent(): Type<CouponsEditContainerComponent> {
    return CouponsEditContainerComponent;
  }
}
