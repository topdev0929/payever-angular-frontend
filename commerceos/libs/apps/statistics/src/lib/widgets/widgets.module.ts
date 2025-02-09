import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NgxChartsModule } from "@swimlane/ngx-charts";

import { I18nModule } from "@pe/i18n";

import { 
  DetailedNumbersComponent,
  WidgetWrapperComponent,
  LineGraphComponent,
  PePercentageComponent,
  TwoColumnsComponent,
  SimpleNumbersComponent,
} from './components';

const components = [
  DetailedNumbersComponent,
  WidgetWrapperComponent,
  LineGraphComponent,
  PePercentageComponent,
  TwoColumnsComponent,
  SimpleNumbersComponent,
];

@NgModule({
  imports:[
    CommonModule,
    I18nModule,
    NgxChartsModule,
  ],
  declarations:[
    ...components,
  ],
  exports:[
    ...components,
  ],

})
export class WidgetsWrapperModule { }