import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { CounterComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule
  ],
  declarations: [ CounterComponent ],
  entryComponents: [ CounterComponent ],
  exports: [ CounterComponent ]
})
export class CounterModule {}
