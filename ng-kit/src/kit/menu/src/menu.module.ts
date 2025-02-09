import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { MenuComponent, MenuItemComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule
  ],
  declarations: [MenuComponent, MenuItemComponent],
  exports: [MenuComponent]
})
export class MenuModule {
}
