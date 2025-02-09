import { NgModule } from '@angular/core';
import { ThemeCardDocComponent } from './theme-card-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ThemeCardModule } from '../../../../kit/theme-card/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    ThemeCardModule
  ],
  declarations: [ThemeCardDocComponent]
})
export class ThemeCardDocModule {
}
