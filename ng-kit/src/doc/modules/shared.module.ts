import { NgModule } from '@angular/core';
import { HtmlEntitiesDirective } from '../directives/html-entities.directive';
import { CodePipe } from '../pipes/code.pipe';
import { SafeUrlPipe } from '../pipes/safe-url.pipe';
import { DocToolsModule } from './doc-tools/doc-tools.module';
import { GuideViewerModule } from './guide-viewer';

@NgModule({
  exports: [
    HtmlEntitiesDirective,
    CodePipe,
    SafeUrlPipe,
    DocToolsModule
  ],
  imports: [
    DocToolsModule,
    GuideViewerModule,
  ],
  declarations: [
    HtmlEntitiesDirective,
    CodePipe,
    SafeUrlPipe
  ]
})
export class DocSharedModule {}
