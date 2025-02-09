import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { LayoutAppKitComponent } from './app';
import { LayoutContentKitComponent } from './content';
import { LayoutHeaderKitComponent } from './header';
import { LayoutLogoKitComponent } from './logo';

@NgModule({
  imports: [
    CommonModule,
    ScrollingModule,
  ],
  declarations: [
    LayoutLogoKitComponent,
    LayoutHeaderKitComponent,
    LayoutAppKitComponent,
    LayoutContentKitComponent,
  ],
  exports: [
    LayoutLogoKitComponent,
    LayoutHeaderKitComponent,
    LayoutAppKitComponent,
    LayoutContentKitComponent,
  ],
})
export class KitLayoutModule {}
