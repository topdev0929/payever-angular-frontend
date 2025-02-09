import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { MatTabsModule } from '@angular/material/tabs';
import { TabSidenavComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    MatTabsModule
  ],
  declarations: [
    TabSidenavComponent
  ],
  entryComponents: [
    TabSidenavComponent
  ],
  exports: [
    TabSidenavComponent
  ]
})
export class TabsModule {}
