import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';

import { PeAlertDialogModule } from '@pe/alert-dialog';
import { PeAuthService } from '@pe/auth';
import { PebAnimationPresetService, PebAnimationService } from '@pe/builder/animations';
import { PebAppsApi, PebEditorAuthTokenService } from '@pe/builder/api';
import { PebContextService } from '@pe/builder/context';
import { PebEnvService } from '@pe/builder/core';
import {
  PebAnimationsFormService,
  PebBackgroundFormService,
  PebInteractionAnimationFormService,
  PebInteractionIntegrationFormService,
  PebInteractionSliderFormService,
  PebInteractionVideoFormService,
  PebInteractionsFormService,
  PebLinkService,
} from '@pe/builder/forms';
import { PebDataSourceService } from '@pe/builder/integrations';
import { PebMediaDialogService } from '@pe/builder/media';
import { PebSideBarService } from '@pe/builder/services';
import { PebCreateShapeService } from '@pe/builder/shapes';
import { PebInspectorState, PebSidebarsState } from '@pe/builder/state';
import { PebRTreeModule } from '@pe/builder/tree';
import {
  PebViewLinkHandler,
  PebViewElementService,
  PebViewOverlayHandler,
  PebViewVideoHandler,
  PebViewCookiesHandler,
  PebViewPageScrollHandler,
  PebViewOverlayService,
  PebViewIntegrationHandler,
  PebViewSliderHandler,
  PebViewSliderService,
  PebViewAnimationsHandler,
  PebViewStylesHandler,
  PebViewStylesService,
  PebViewLazyLoadHandler,
  PebDashboardPartialContentService,
  PebPartialContentService,
  PebViewPartialContentHandler,
  PebViewContextHandler,
  PebViewContextRenderService,
  PebViewContextDataService,
  PebViewContextTriggerService,
  PebViewCookiesPermissionService,
} from '@pe/builder/view-handlers';
import { EnvironmentConfigInterface, EnvService, PebDeviceService, PeHelpfulService, PE_ENV } from '@pe/common';
import { FolderService, PeFoldersActionsService, PeFoldersApiService, PeFoldersModule, PE_FOLDERS_API_PATH } from '@pe/folders';
import { PeGridModule, PeGridState, PeMoveOverviewService } from '@pe/grid';
import { I18nModule } from '@pe/i18n';

import { PeBuilderAppStyleComponent } from './app-style.component';
import { PeBuilderAppComponent } from './app.component';
import { BUILDER_STATES } from './constants';


const VIEW_HANDLER_PROVIDERS = [
  PebViewOverlayService,
  PebAnimationService,
  PebViewElementService,
  PebViewSliderService,
  PebViewLinkHandler,
  PebViewOverlayHandler,
  PebViewVideoHandler,
  PebViewCookiesHandler,
  PebViewPageScrollHandler,
  PebViewIntegrationHandler,
  PebViewSliderHandler,
  PebViewAnimationsHandler,
  PebViewStylesHandler,
  PebViewStylesService,
  PebViewLazyLoadHandler,
  PebDashboardPartialContentService,
  PebViewPartialContentHandler,
  PebViewContextHandler,
  PebViewContextRenderService,
  PebViewContextDataService,
  PebViewContextTriggerService,
];

const FORM_PROVIDERS = [
  PebAnimationsFormService,
  PebInteractionsFormService,
  PebInteractionAnimationFormService,
  PebInteractionSliderFormService,
  PebInteractionVideoFormService,
  PebInteractionIntegrationFormService,
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatIconModule,
    PeAlertDialogModule,
    PeFoldersModule,
    NgxsModule.forFeature([
      PebSidebarsState,
      PebInspectorState,
      PeGridState,
      ...BUILDER_STATES,
    ]),
    I18nModule.forRoot(),
    ClipboardModule,
    PeGridModule,
    PebRTreeModule,
  ],
  declarations: [
    PeBuilderAppComponent,
    PeBuilderAppStyleComponent,
  ],
  exports: [
    PeBuilderAppComponent,
  ],
  providers: [
    PebAppsApi,
    PebAnimationService,
    PebAnimationPresetService,
    PebViewCookiesPermissionService,
    PebDeviceService,
    PeFoldersActionsService,
    FolderService,
    PeFoldersApiService,
    PeMoveOverviewService,
    PeHelpfulService,
    {
      provide: PebEnvService,
      useExisting: EnvService,
    },
    {
      provide: PebEditorAuthTokenService,
      deps: [PeAuthService],
      useFactory: (authService: PeAuthService) => ({
        get token() {
          return authService.token;
        },
        access: null,
      }),
    },
    {
      deps: [PE_ENV],
      provide: PE_FOLDERS_API_PATH,
      useFactory: (env: EnvironmentConfigInterface) => env.backend.shops + '/api',
    },
    PebSideBarService,
    PebLinkService,
    PebCreateShapeService,
    PebBackgroundFormService,
    PebDataSourceService,
    PebContextService,
    PebMediaDialogService,
    ...FORM_PROVIDERS,
    ...VIEW_HANDLER_PROVIDERS,
    {
      provide: PebPartialContentService,
      useClass: PebDashboardPartialContentService,
    },
  ],
})
export class PeBuilderAppModule {
  constructor(
    private readonly linkEventHandler: PebViewLinkHandler,
    private readonly overlayHandler: PebViewOverlayHandler,
    private readonly videoHandler: PebViewVideoHandler,
    private readonly cookiesHandler: PebViewCookiesHandler,
    private readonly pageScrollHandler: PebViewPageScrollHandler,
    private readonly integrationHandler: PebViewIntegrationHandler,
    private readonly animationsHandler: PebViewAnimationsHandler,
    private readonly sliderHandler: PebViewSliderHandler,
    private readonly stylesHandler: PebViewStylesHandler,
    private readonly lazyLoadHandler: PebViewLazyLoadHandler,
    private readonly partialContentHandler: PebViewPartialContentHandler,
    private readonly contextHandler: PebViewContextHandler,
  ) {
  }
}
