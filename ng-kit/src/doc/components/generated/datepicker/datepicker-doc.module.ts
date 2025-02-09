import { NgModule } from '@angular/core';

import { DatepickerDocComponent } from './datepicker-doc.component';
import {
  DatepickerDefaultExampleDocComponent,
  DatepickerMonthExampleDocComponent
} from './examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { FormComponentsDatepickerModule } from '../../../../kit/form-components/datepicker';

@NgModule({
  imports: [
    DocComponentSharedModule,
    FormComponentsDatepickerModule
  ],
  declarations: [
    DatepickerDocComponent,
    DatepickerDefaultExampleDocComponent,
    DatepickerMonthExampleDocComponent
  ]
})
export class DatepickerDocModule {
}
