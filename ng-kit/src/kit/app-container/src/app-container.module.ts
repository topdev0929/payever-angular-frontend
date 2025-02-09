import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppContainerComponent } from './app-container.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AppContainerComponent
  ],
  entryComponents: [ AppContainerComponent ],
  exports: [ AppContainerComponent ]
})
export class AppContainerModule {}
