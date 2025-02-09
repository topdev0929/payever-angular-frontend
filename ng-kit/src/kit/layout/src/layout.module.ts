import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { LocationModule } from '../../location';
import { DevModule } from '../../dev';

import { LayoutAppComponent } from './app/layout-app.component';
import { LayoutTabsetComponent, LayoutTabComponent } from './tabs';
import { LayoutSidebarComponent } from './sidebar/layout-sidebar.component';
import { LayoutContentComponent } from './content/layout-content.component';
import { LayoutService } from './services';

import { LayoutPageComponent } from './page/page.component';
import { LayoutHeaderComponent } from './header/layout-header.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { LayoutBackComponent } from './back/back.component';

@NgModule({
  imports: [
    CommonModule,
    LocationModule,
    RouterModule,
    DevModule,
  ],
  declarations: [
    LayoutPageComponent,
    LayoutHeaderComponent,
    LayoutBackComponent,
    SpinnerComponent,
    LayoutAppComponent,
    LayoutTabsetComponent,
    LayoutTabComponent,
    LayoutSidebarComponent,
    LayoutContentComponent
  ],
  providers: [
    LayoutService
  ],
  exports: [
    LayoutPageComponent,
    LayoutHeaderComponent,
    LayoutBackComponent,
    SpinnerComponent,
    LayoutAppComponent,
    LayoutTabsetComponent,
    LayoutTabComponent,
    LayoutSidebarComponent,
    LayoutContentComponent
  ]
})
export class LayoutModule {}
