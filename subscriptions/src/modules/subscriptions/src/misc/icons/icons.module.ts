import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SidebarGroupIconsComponent } from './sidebar-group-icons/sidebar-group-icons.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    SidebarGroupIconsComponent,
  ],
  exports: [
    SidebarGroupIconsComponent,
  ],
})
export class PesIconsModule {}
