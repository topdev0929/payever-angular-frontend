import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { FormModule as NgKitFormModule } from '@pe/ng-kit/modules/form';
import { IconsProviderModule } from '@pe/ng-kit/modules/icons-provider';
import { CounterModule } from '@pe/ng-kit/modules/counter';

import { SharedModule } from '../shared';

import { CartEditComponent } from './cart-edit.component';
import { CartEditContainerComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSelectModule,

    I18nModule.forChild(),
    NgKitFormModule,
    IconsProviderModule,
    CounterModule,

    SharedModule
  ],
  declarations: [
    CartEditComponent,
    CartEditContainerComponent
  ],
  providers: [
  ]
})
export class CartEditModule {
}
