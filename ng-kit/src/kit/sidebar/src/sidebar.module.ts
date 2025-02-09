import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, SidebarLayoutComponent } from './components';
import { BrowserModule } from '../../browser/src';

@NgModule({
  imports: [ CommonModule, BrowserModule ],
  declarations: [
    SidebarComponent,
    SidebarLayoutComponent
  ],
  entryComponents: [ SidebarComponent ],
  exports: [
    SidebarComponent,
    SidebarLayoutComponent
  ]
})
export class SidebarModule {}
