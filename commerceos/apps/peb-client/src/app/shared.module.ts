import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { PebAnimationModule } from '@pe/builder/animations';
import { PebDirectivesModule } from '@pe/builder/directives';
import {
  PebIntegrationState,
  PebMockConnector,
  PebPagesConnector,
  PebProductsConnector,
  PebSettingsConnector,
} from '@pe/builder/integrations';
import { PebFillModule, PebVectorElementModule } from '@pe/builder/renderer-fill';
import { PebViewState } from '@pe/builder/view-state';

import { PebClientPageNotFoundComponent } from './page/page-not-found.component';
import { PebClientPageComponent } from './page/page.component';
import { PebClientElementDirective } from './renderer/directives/element.directive';
import { PebClientRendererComponent } from './renderer/renderer.component';

@NgModule({
  declarations: [
    PebClientPageComponent,
    PebClientRendererComponent,
    PebClientElementDirective,
    PebClientPageNotFoundComponent,
  ],
  imports: [
    CommonModule,
    NgxsModule.forFeature([PebViewState, PebIntegrationState]),
    PebDirectivesModule,
    PebFillModule,
    PebVectorElementModule,
    PebAnimationModule,
  ],
  providers: [
    PebMockConnector,
    PebProductsConnector,
    PebSettingsConnector,
    PebPagesConnector,
  ],
})
export class PebClientSharedModule { }
