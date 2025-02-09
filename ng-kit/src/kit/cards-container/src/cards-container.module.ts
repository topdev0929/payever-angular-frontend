import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardsContainerComponent } from './cards-container.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    CardsContainerComponent
  ],
  entryComponents: [ CardsContainerComponent ],
  exports: [ CardsContainerComponent ]
})
export class CardsContainerModule {}
