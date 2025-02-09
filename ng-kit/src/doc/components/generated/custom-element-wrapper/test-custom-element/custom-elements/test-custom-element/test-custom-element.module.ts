import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { I18nModule } from '../../../../../../../../modules/i18n';
import { FormModule as NgKitFormModule } from '../../../../../../../../modules/form';
import { CounterModule } from '../../../../../../../../modules/counter';

import { TestCustomElementComponent } from './test-custom-element.component';
import { TestCustomElementContainerComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSelectModule,

    I18nModule.forChild(),
    NgKitFormModule,
    CounterModule
  ],
  declarations: [
    TestCustomElementComponent,
    TestCustomElementContainerComponent
  ],
  providers: [
  ]
})
export class TestCustomElementModule {
}
