import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ThreejsRendererComponent } from './components/three-js-renderer.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ThreejsRendererComponent],
  exports: [ThreejsRendererComponent],
})
export class ThreeJsRendererModule {}
