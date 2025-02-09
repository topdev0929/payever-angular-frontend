import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { I18nModule } from "@pe/i18n";
import { PebButtonModule, PebListInfoModule, PebSelectModule } from "@pe/ui";

import { LogoAndStatusPickerComponent } from "./logo-and-status-picker.component";

@NgModule({
  imports: [
    CommonModule, 
    I18nModule, 
    PebListInfoModule, 
    PebButtonModule,
    PebSelectModule,
    MatProgressSpinnerModule,
  ],
  declarations: [LogoAndStatusPickerComponent],
  exports: [LogoAndStatusPickerComponent],
})
export class LogoAndStatusPickerModule { }
