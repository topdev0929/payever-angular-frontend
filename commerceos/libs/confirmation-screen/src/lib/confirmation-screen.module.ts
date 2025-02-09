import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ConfirmationOverlayScreenStyleComponent } from './confirm-screen-style.component';
import { ConfirmationOverlayScreenComponent } from './confirm-screen.component';

@NgModule({
  declarations:[
    ConfirmationOverlayScreenComponent,
    ConfirmationOverlayScreenStyleComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class ConfirmationScreenModule { }
