import { NgModule } from '@angular/core';
import { SwitcherDocComponent } from './switcher-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ThemeSwitcherModule } from '../../../../kit/theme-switcher/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    ThemeSwitcherModule
  ],
  declarations: [SwitcherDocComponent]
})
export class SwitcherDocModule {
}
