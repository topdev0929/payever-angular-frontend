import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PebAnimationPresetService } from '@pe/builder/animations';
import { PebPagesConnector, PebProductsConnector } from '@pe/builder/integrations';
import {
  PebPartialContentService,
  PebViewAnimationsHandler,  
  PebViewContextHandler,
  PebViewContextRenderService,
  PebViewContextTriggerService,
  PebViewCookiesPermissionService,
  PebViewElementService,
  PebViewLazyLoadHandler,
  PebViewOverlayHandler,
  PebViewOverlayService,
  PebViewScriptService,
  PebViewSliderHandler,
  PebViewSliderService,
  PebViewStylesHandler,
  PebViewStylesService,
} from '@pe/builder/view-handlers';

import { PebServerConnectorsGuard } from './guards/server-connectors.guard';
import { PebClientPageComponent } from './page/page.component';
import { PebClientPageResolver } from './resolvers/page.resolver';
import { PebClientThemeResolver } from './resolvers/theme.resolver';
import { PebServerPartialContentService } from './services';
import { PebClientSharedModule } from './shared.module';


const SSR_VIEW_HANDLER_PROVIDERS = [
  PebAnimationPresetService,
  PebViewOverlayService,
  PebViewCookiesPermissionService,
  PebViewScriptService,
  PebViewElementService,
  PebViewSliderService,
  PebViewOverlayHandler,
  PebViewSliderHandler,
  PebViewStylesHandler,
  PebViewStylesService,
  PebViewAnimationsHandler,
  PebViewLazyLoadHandler,
  PebViewContextHandler,
  PebViewContextRenderService,
  PebViewContextTriggerService,
];

const SERVER_CONNECTOR_PROVIDERS = [
  PebServerConnectorsGuard,
  PebPagesConnector,
  PebProductsConnector,
];

@NgModule({
  imports: [    
    PebClientSharedModule,
    RouterModule.forChild([
      {
        path: '',        
        canActivate: [PebServerConnectorsGuard],
        resolve: { theme: PebClientThemeResolver },
        children: [
          {
            path: '**',
            component: PebClientPageComponent,
            resolve: { app: PebClientPageResolver },
          },
        ],
      },
    ]),
  ],
  providers: [
    ...SERVER_CONNECTOR_PROVIDERS,
    ...SSR_VIEW_HANDLER_PROVIDERS,
    {
      provide: PebPartialContentService,
      useClass: PebServerPartialContentService,
    },
  ],
})
export class ServerModule {
  constructor(
    private readonly overlayHandler: PebViewOverlayHandler,
    private readonly sliderHandler: PebViewSliderHandler,
    private readonly stylesHandler: PebViewStylesHandler,
    private readonly animationHandler: PebViewAnimationsHandler,
    private readonly lazyLoadHandler: PebViewLazyLoadHandler,
    private readonly contextHandler: PebViewContextHandler,
  ) {
  }
}
