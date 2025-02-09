import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ProgressButtonDocComponent } from './progress-button/progress-button-doc.component';
import { ProgressButtonExampleDocComponent } from './progress-button/examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ButtonModule } from '../../../../kit/button';

@NgModule({
  imports: [
    DocComponentSharedModule,
    ButtonModule,
    MatButtonModule
  ],
  declarations: [
    ProgressButtonDocComponent,
    ProgressButtonExampleDocComponent
  ]
})
export class ButtonDocModule {
}
