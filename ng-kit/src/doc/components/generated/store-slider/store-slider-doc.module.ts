import { NgModule } from '@angular/core';
import { StoreSliderDocComponent } from './store-slider-doc.component';
import { StoreSliderServiceDocComponent } from './store-slider-service-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { StoreSliderModule } from '../../../../kit/store-slider';

@NgModule({
  imports: [
    DocComponentSharedModule,
    StoreSliderModule
  ],
  declarations: [
    StoreSliderDocComponent,
    StoreSliderServiceDocComponent
  ]
})
export class StoreSliderDocModule {
}
