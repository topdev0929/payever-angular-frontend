import { NgModule } from '@angular/core';
import { IconsDocComponent } from './icons-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { IconsProviderModule } from '../../../../kit/icons-provider';

@NgModule({
  imports: [
    DocComponentSharedModule,
    IconsProviderModule
  ],
  declarations: [IconsDocComponent]
})
export class IconsDocModule {
}
