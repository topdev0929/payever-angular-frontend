import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CheckoutModalModule } from './modal';
import { NavbarComponent, OverlayContainerComponent } from './components';
import { CheckoutModalComponent } from './modal/components/checkout-modal.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    MatCardModule,
    MatMenuModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
    MatDividerModule,
    CheckoutModalModule,
    MatProgressSpinnerModule,
  ],
  declarations: [
    NavbarComponent,
    OverlayContainerComponent
  ],
  exports: [
    NavbarComponent,
    CheckoutModalComponent,
    OverlayContainerComponent
  ]
})
export class SharedModule {}
