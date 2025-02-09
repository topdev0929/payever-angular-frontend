import { NgModule } from '@angular/core';
import { PriceDocComponent } from './price-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { PriceModule } from '../../../../kit/price';

@NgModule({
  imports: [
    DocComponentSharedModule,
    PriceModule
  ],
  declarations: [PriceDocComponent]
})
export class PriceDocModule {
}
