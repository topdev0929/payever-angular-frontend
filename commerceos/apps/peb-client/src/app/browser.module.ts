import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PebAnimationPresetService, PebAnimationService } from '@pe/builder/animations';
import {
  PebCheckoutConnector,
  PebIntegrationSnackbarHandler,
  PebIntegrationLanguageHandler,
  PebIntegrationMessageHandler,
  PebMessageConnector,
  PebLanguageConnector,
  PebPagesConnector,
  PebProductsConnector,
} from '@pe/builder/integrations';
import {
  PebViewLinkHandler,
  PebViewElementService,
  PebViewOverlayHandler,
  PebViewVideoHandler,
  PebViewCookiesHandler,
  PebViewScriptHandler,
  PebViewPageScrollHandler,
  PebViewOverlayService,
  PebViewIntegrationHandler,
  PebViewSliderHandler,
  PebViewSliderService,
  PebViewAnimationsHandler,
  PebViewStylesHandler,
  PebViewStylesService,
  PebViewLazyLoadHandler,
  PebPartialContentService,
  PebViewPartialContentHandler,
  PebViewContextHandler,
  PebViewLanguageHandler,
  PebViewContextRenderService,
  PebViewContextTriggerService,
  PebViewCookiesPermissionService,
  PebViewScriptService,
} from '@pe/builder/view-handlers';

import { PebBrowserClientAppComponent } from './browser-app.component';
import { PebBrowserConnectorsGuard } from './guards/browser-connectors.guard';
import { PebClientPageComponent } from './page/page.component';
import { PebClientPageResolver } from './resolvers/page.resolver';
import { PebClientThemeResolver } from './resolvers/theme.resolver';
import { PebBrowserPartialContentService } from './services';
import { PebClientCheckoutLoaderService } from './services/checkout-loader.service';
import { PebClientSharedModule } from './shared.module';


const VIEW_HANDLER_PROVIDERS = [
  PebViewOverlayService,
  PebViewCookiesPermissionService,
  PebViewScriptService,
  PebAnimationService,
  PebAnimationPresetService,
  PebViewElementService,
  PebViewSliderService,
  PebViewLinkHandler,
  PebViewOverlayHandler,
  PebViewVideoHandler,
  PebViewCookiesHandler,
  PebViewScriptHandler,
  PebViewPageScrollHandler,
  PebViewIntegrationHandler,
  PebViewLanguageHandler,
  PebViewSliderHandler,
  PebViewAnimationsHandler,
  PebViewStylesHandler,
  PebViewStylesService,
  PebViewLazyLoadHandler,
  PebViewPartialContentHandler,
  PebViewContextHandler,
  PebViewContextRenderService,
  PebViewContextTriggerService,
];

const BROWSER_CONNECTOR_PROVIDERS = [
  PebBrowserConnectorsGuard,
  PebCheckoutConnector,
  PebMessageConnector,
  PebLanguageConnector,
  PebPagesConnector,
  PebIntegrationSnackbarHandler,
  PebIntegrationMessageHandler,
  PebIntegrationLanguageHandler,
  PebClientCheckoutLoaderService,
  PebProductsConnector,
];

@NgModule({
  declarations: [PebBrowserClientAppComponent],
  imports: [
    CommonModule,
    PebClientSharedModule,
    RouterModule.forChild(
      [
        {
          path: '',
          component: PebBrowserClientAppComponent,
          canActivate: [PebBrowserConnectorsGuard],
          resolve: { theme: PebClientThemeResolver },
          children: [
            {
              path: '**',
              component: PebClientPageComponent,
              resolve: { app: PebClientPageResolver },
            },
          ],
        },
      ],
    ),
  ],
  providers: [
    ...BROWSER_CONNECTOR_PROVIDERS,
    ...VIEW_HANDLER_PROVIDERS,
    {
      provide: PebPartialContentService,
      useClass: PebBrowserPartialContentService,
    },
  ],
})
export class BrowserModule {
  constructor(
    private readonly messageEventHandler: PebIntegrationMessageHandler,
    private readonly languageEventHandler: PebIntegrationLanguageHandler,
    private readonly viewLanguageHandler: PebViewLanguageHandler,
    private readonly snackbarHandler: PebIntegrationSnackbarHandler,
    private readonly linkEventHandler: PebViewLinkHandler,
    private readonly overlayHandler: PebViewOverlayHandler,
    private readonly videoHandler: PebViewVideoHandler,
    private readonly cookiesHandler: PebViewCookiesHandler,
    private readonly scriptHandler: PebViewScriptHandler,
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
