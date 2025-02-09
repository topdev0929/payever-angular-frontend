import { NgModule } from '@angular/core';

import { HtmlEntitiesDirective } from '../directives/html-entities.directive';
import { CodePipe } from '../pipes/code.pipe';
import { SafeUrlPipe } from '../pipes/safe-url.pipe';

@NgModule({
  exports: [
    HtmlEntitiesDirective,
    CodePipe,
    SafeUrlPipe
  ],
  declarations: [
    HtmlEntitiesDirective,
    CodePipe,
    SafeUrlPipe
  ]
})
export class DocSharedModule {}
