import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

import { PebDateTimePickerComponent } from './datetime-picker';

@NgModule({
  imports: [CommonModule, MatDatepickerModule, OverlayModule, PortalModule, MatMomentDateModule],
  declarations: [PebDateTimePickerComponent],
  exports: [PebDateTimePickerComponent],
})
export class PebDateTimePickerModule {}
