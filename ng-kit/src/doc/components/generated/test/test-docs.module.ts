import { NgModule } from '@angular/core';

import {
  TestDocsFakeOverlayContainerComponent,
  TestDocsImageUrlBase64FixtureComponent,
  TestDocsNonRecompilableTestModuleHelperComponent,
  TestDocsNoopComponentComponent,
  TestDocsOverrideChangeDetectionStrategyHelperComponent,
} from './components';
import { DocComponentSharedModule } from '../doc-component-shared.module';

@NgModule({
  imports: [
    DocComponentSharedModule
  ],
  declarations: [
    TestDocsFakeOverlayContainerComponent,
    TestDocsImageUrlBase64FixtureComponent,
    TestDocsNonRecompilableTestModuleHelperComponent,
    TestDocsNoopComponentComponent,
    TestDocsOverrideChangeDetectionStrategyHelperComponent,
  ]
})
export class TestDocsModule {}
