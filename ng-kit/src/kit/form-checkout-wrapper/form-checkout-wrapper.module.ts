import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxWebstorageModule } from 'ngx-webstorage';

import { MAT_RIPPLE_GLOBAL_OPTIONS } from '@angular/material/core';

import { FormCoreModule } from '../form-core/form-core.module';
import { FormComponentsInputModule } from '../form-components/input/form-components-input.module';
import { FormComponentsInputCurrencyModule } from '../form-components/input-currency/form-components-input-currency.module';
import { FormComponentsAutocompleteModule } from '../form-components/autocomplete/form-components-autocomplete.module';
import { TooltipIconModule } from '../form-components/tooltip-icon/tooltip-icon.module';

import { FormLoginFieldsetComponent } from './components';

const shared: any = [
  FormLoginFieldsetComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxWebstorageModule.forRoot({
      prefix: 'pe.common',
      separator: '.',
      caseSensitive: true
    }),
    FormCoreModule,
    FormComponentsInputModule,
    FormComponentsInputCurrencyModule,
    FormComponentsAutocompleteModule,
    TooltipIconModule
  ],
  declarations: [
    ...shared
  ],
  entryComponents: [
    ...shared
  ],
  exports: [
    ...shared,
    FormCoreModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      // TODO Maybe move to form components?
      provide: MAT_RIPPLE_GLOBAL_OPTIONS,
      useValue: { disabled: true }
    }
  ]
})
export class FormCheckoutWrapperModule {}
