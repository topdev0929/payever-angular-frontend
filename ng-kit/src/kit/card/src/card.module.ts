import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { MatCardModule } from '@angular/material/card';

import { CardComponent, CardActionsComponent, CardContentComponent, CardHeaderComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    MatCardModule
  ],
  declarations: [
    CardComponent,
    CardActionsComponent,
    CardContentComponent,
    CardHeaderComponent
  ],
  entryComponents: [
    CardComponent
  ],
  exports: [
    MatCardModule,
    CardComponent,
    CardActionsComponent,
    CardContentComponent,
    CardHeaderComponent
  ]
})
export class CardModule {}
