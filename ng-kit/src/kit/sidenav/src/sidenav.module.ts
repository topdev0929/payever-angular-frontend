import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { MatButtonModule } from '@angular/material/button';
import { MAT_RIPPLE_GLOBAL_OPTIONS } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { SidenavComponent, DrawerComponent, SidenavHeaderComponent, SidenavSubheaderButtonsComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  declarations: [
    SidenavComponent,
    DrawerComponent,
    SidenavHeaderComponent,
    SidenavSubheaderButtonsComponent
  ],
  entryComponents: [
    SidenavComponent,
    SidenavHeaderComponent,
    SidenavSubheaderButtonsComponent
  ],
  exports: [
    SidenavComponent,
    DrawerComponent,
    SidenavHeaderComponent,
    SidenavSubheaderButtonsComponent
  ],
  providers: [
    {
      provide: MAT_RIPPLE_GLOBAL_OPTIONS,
      useValue: { disabled: true }
    }
  ]
})
export class SidenavModule {}
