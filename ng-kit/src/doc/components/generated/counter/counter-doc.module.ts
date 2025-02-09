import { NgModule } from '@angular/core';
import { CounterDocComponent } from './counter-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { CounterModule } from '../../../../kit/counter';

@NgModule({
  imports: [
    DocComponentSharedModule,
    CounterModule
  ],
  declarations: [CounterDocComponent]
})
export class CounterDocModule {
}
