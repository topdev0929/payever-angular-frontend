import { NgModule } from '@angular/core';
import { ThemeSwitcherDocComponent } from './theme-switcher-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ThemeSwitcherModule } from '../../../../kit/theme-switcher/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    ThemeSwitcherModule
  ],
  declarations: [ThemeSwitcherDocComponent]
})
export class ThemeSwitcherDocModule {
}
