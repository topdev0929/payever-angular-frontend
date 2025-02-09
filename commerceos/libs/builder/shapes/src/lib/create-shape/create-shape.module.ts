import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { PebSelectInputModule, PebTextInputModule } from '@pe/builder/form-controls';
import { PebRendererModule } from '@pe/builder/renderer';
import { OverlayWidgetModule, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PebFormFieldInputModule } from '@pe/ui';

import { PebCreateShapeDialog } from './create-shape.dialog';
import { PebCreateShapeService } from './create-shape.service';

@NgModule({
  declarations: [PebCreateShapeDialog],
  imports: [
    CommonModule,
    PebFormFieldInputModule,
    ReactiveFormsModule,
    PebTextInputModule,
    OverlayWidgetModule,
    PebRendererModule,
    PebSelectInputModule,
    MatMenuModule,
    MatIconModule,
  ],
  providers: [PebCreateShapeService, PeOverlayWidgetService],
  exports: [PebCreateShapeDialog],
})
export class PebCreateShapeModule {}
