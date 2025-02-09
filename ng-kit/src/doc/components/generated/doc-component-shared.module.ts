import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { DocSharedModule } from '../../modules';
import { ExampleViewerModule } from '../../modules/example-viewer/src';
import { DocViewerModule } from '../../modules/doc-viewer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabsModule,
    DocSharedModule,
    ExampleViewerModule,
    DocViewerModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabsModule,
    DocSharedModule,
    ExampleViewerModule,
    DocViewerModule
  ]
})
export class DocComponentSharedModule {
}
