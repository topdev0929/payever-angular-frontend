import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeSetComponent } from './badge-set.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    BadgeSetComponent,
  ],
  entryComponents: [ BadgeSetComponent ],
  exports: [ BadgeSetComponent ]
})
export class BadgeModule {}
