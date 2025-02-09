import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';
import { Routes, RouterModule } from '@angular/router';

import {
  PebFormFieldInputModule,
  PebButtonModule,
  PebFormBackgroundModule,
  PebButtonToggleModule,
  PebSelectModule,
} from '@pe/ui';

import { SharedModule } from '../../../../shared';
import { ProductPickerModule } from '../product-picker/product-picker.module';
import { ActionsVerifyModule } from '../verify';

import { AmountComponent } from './amount/amount.component';
import { ReturnOptionsComponent } from './return-options/return-options.component';
import { ActionShippingGoodsComponent } from './shipping-goods.component';
import { ShippingOptionsComponent } from './shipping-options/shipping-options.component';


const routes: Routes = [{
  path: '',
  component: ActionShippingGoodsComponent,
}];

@NgModule({
  declarations: [
    ActionShippingGoodsComponent,
    ShippingOptionsComponent,
    ReturnOptionsComponent,
    AmountComponent,
  ],
  imports: [
    SharedModule,
    PebFormFieldInputModule,
    PebButtonModule,
    PebFormBackgroundModule,
    PebButtonToggleModule,
    MatAutocompleteModule,
    MatExpansionModule,
    PebSelectModule,
    ProductPickerModule,
    ActionsVerifyModule,
    RouterModule.forChild(routes),
  ],
})
export class ActionShippingGoodsModule { }
