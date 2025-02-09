import { NgModule } from '@angular/core';
import { ShortcutsDocComponent } from './shortcuts-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ShortcutsModule } from '../../../../kit/shortcuts/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    ShortcutsModule
  ],
  declarations: [ShortcutsDocComponent]
})
export class ShortcutsDocModule {
}
