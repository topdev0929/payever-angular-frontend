import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeCardComponent } from './theme-card.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ThemeCardComponent
  ],
  entryComponents: [ ThemeCardComponent ],
  exports: [ ThemeCardComponent ]
})
export class ThemeCardModule {}
