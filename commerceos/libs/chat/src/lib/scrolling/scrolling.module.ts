import { ScrollingModule as CdkScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { VirtualForDirective } from './virtual-for.directive';
import { PeMessageVirtualScrollDirective } from './virtual-scroll';
import { VirtualScrollViewportStylesComponent } from './virtual-scroll-viewport-styles.component';
import { VirtualScrollViewportComponent } from './virtual-scroll-viewport.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CdkScrollingModule,
  ],
  declarations: [
    PeMessageVirtualScrollDirective,
    VirtualScrollViewportComponent,
    VirtualScrollViewportStylesComponent,
    VirtualForDirective,
  ],
  exports: [
    VirtualScrollViewportComponent,
    VirtualForDirective,
  ],
})

export class ScrollingModule {}
