import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { HighlightModule } from 'ngx-highlightjs';
// @ts-ignore
import typescript from 'highlight.js/lib/languages/typescript'; //

import { DocSharedModule } from '../../shared.module';
import { ExampleViewerComponent, DocContentViewerComponent } from './components';

export function hljsLanguages(): any[] {
  return [
    {name: 'typescript', func: typescript}
  ];
}

@NgModule({
  imports: [
    CommonModule,
    TabsModule.forRoot(),
    DocSharedModule,
    HighlightModule.forRoot({
      languages: hljsLanguages
    }),
  ],
  declarations: [
    ExampleViewerComponent,
    DocContentViewerComponent
  ],
  exports: [
    ExampleViewerComponent,
    DocContentViewerComponent
  ]
})
export class ExampleViewerModule {}
