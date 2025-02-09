import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { NavbarComponent, OverlayContainerComponent } from './components';
import { CheckoutModalModule } from './modal';
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
    OverlayContainerComponent,
  ],
  exports: [
    NavbarComponent,
    CheckoutModalComponent,
    OverlayContainerComponent,
  ],
})
export class SharedModule {}
