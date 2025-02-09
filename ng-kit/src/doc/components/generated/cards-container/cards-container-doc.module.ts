import { NgModule } from '@angular/core';
import { CardsContainerDocComponent } from './cards-container-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { CardsContainerModule } from '../../../../kit/cards-container/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    CardsContainerModule
  ],
  declarations: [CardsContainerDocComponent]
})
export class CardsContainerDocModule {

}
