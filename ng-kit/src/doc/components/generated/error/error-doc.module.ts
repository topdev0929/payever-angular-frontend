import { NgModule } from '@angular/core';
import { ErrorDocComponent } from './error-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ErrorModule } from '../../../../kit/error/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    ErrorModule
  ],
  declarations: [ErrorDocComponent]
})
export class ErrorDocModule {
}
