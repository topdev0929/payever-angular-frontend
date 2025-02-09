import { NgModule } from '@angular/core';
import { MenuDocComponent } from './menu-doc.component';
import { MenuExampleDefaultComponent } from './examples/default';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { MenuModule } from '../../../../kit/menu';

@NgModule({
  imports: [
    DocComponentSharedModule,
    MenuModule
  ],
  declarations: [
    MenuDocComponent,
    MenuExampleDefaultComponent
  ]
})
export class MenuDocModule {
}
