import { CommonModule } from "@angular/common";
import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatTabsModule } from "@angular/material/tabs";

import { I18nModule } from "@pe/i18n";
import { PebButtonModule, PebExpandablePanelModule, PebFormBackgroundModule, PebFormFieldInputModule, PebSelectModule } from "@pe/ui";

import { StatisticsFieldComponent } from "../misc/components/statistics-field";
import { SelectedOptionsPipe } from "../misc/pipes";
import { WidgetsWrapperModule } from "../widgets";

import {
  StatisticsAppComponent,
  PeStatisticsEditFormComponent,
  PeStatisticsWidgetSizeComponent,
  PeStatisticsFormComponent,
  PeFieldFormComponent,
  WidgetStyleComponent,
} from './components';
import { PeStatisticsOverlayComponent } from "./statistics-overlay.component";

const i18nModuleForRoot: ModuleWithProviders<I18nModule> = I18nModule.forRoot();


@NgModule({
  imports:[
    CommonModule,
    MatTabsModule,
    FormsModule,
    WidgetsWrapperModule,
    ReactiveFormsModule,
    PebFormFieldInputModule,
    PebExpandablePanelModule,
    PebFormBackgroundModule,
    PebSelectModule,
    PebButtonModule,
    i18nModuleForRoot,
  ],
  declarations:[
    PeStatisticsOverlayComponent,
    StatisticsAppComponent,
    PeStatisticsWidgetSizeComponent,
    WidgetStyleComponent,
    PeStatisticsFormComponent,
    PeFieldFormComponent,
    PeStatisticsEditFormComponent,
    StatisticsFieldComponent,
    SelectedOptionsPipe,
  ],
  exports:[
    PeStatisticsOverlayComponent,
    PeStatisticsFormComponent,
  ],

})
export class StatisticsOverlayModule { }
