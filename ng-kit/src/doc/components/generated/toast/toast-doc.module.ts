import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorToastExampleComponent } from './examples/error-toast-example/error-toast-example.component';
import { ToastModule } from '../../../../kit/toast/src';
import { IconsProviderModule } from '../../../../kit/icons-provider';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ToastDocComponent } from './toast-doc.component';

@NgModule({
  declarations: [
    ErrorToastExampleComponent,
    ToastDocComponent
  ],
  imports: [
    CommonModule,
    ToastModule,
    IconsProviderModule,
    DocComponentSharedModule,
  ]
})
export class ToastDocModule { }
