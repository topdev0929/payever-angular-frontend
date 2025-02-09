import { NgModule } from '@angular/core';
import { BadgeSetDocComponent } from './badge-set-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { BadgeModule } from '../../../../kit/badge/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    BadgeModule
  ],
  declarations: [BadgeSetDocComponent]
})
export class BadgeSetDocModule {

}
