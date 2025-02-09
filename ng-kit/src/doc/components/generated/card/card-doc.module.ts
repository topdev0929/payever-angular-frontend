import { NgModule } from '@angular/core';
import { CardDocComponent } from './card-doc.component';
import { CardDefaultExampleDocComponent } from './examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { CardModule } from '../../../../kit/card/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    CardModule
  ],
  declarations: [
    CardDocComponent,
    CardDefaultExampleDocComponent
  ]
})
export class CardDocModule {

}
