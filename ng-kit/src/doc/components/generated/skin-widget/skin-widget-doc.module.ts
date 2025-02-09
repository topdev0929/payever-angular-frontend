import { NgModule } from '@angular/core';
import { SkinWidgetDocComponent } from './skin-widget-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { SkinWidgetModule } from '../../../../kit/skin-widget/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    SkinWidgetModule
  ],
  declarations: [SkinWidgetDocComponent]
})
export class SkinWidgetDocModule {
}
