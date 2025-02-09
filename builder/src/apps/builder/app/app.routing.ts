import { Injectable, NgModule } from '@angular/core';
import { PreloadingStrategy, Route, RouterModule, Routes } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';

import { MicroContainerTypeEnum } from '@pe/ng-kit/modules/common';
import { TranslationGuard } from '@pe/ng-kit/modules/i18n';
import { environment } from '../../../environments/environment';
import { ThemeContextGuard } from '../../../modules-new/core/guards/theme-context.guard';
import { DevTranslationGuard } from '../../../modules-new/core/guards/translation.guard';
import { AppLoadedResolver } from '../../../modules-new/core/resolvers/app-loaded.resolver';
import { ApplicationDataGuard } from './guards/application-data.guard';
import { MicroResolver } from './resolvers/micro.resolver';

// tslint:disable-next-line:no-require-imports
const fallbackTranslations = require('../../../../assets/locale/app.json');

const isDev = !environment.production;

const baseRoute: Routes = [
  {
    path: 'business/:businessId/old-builder/:appType/:appId/builder',
    canActivate: [
      isDev ? DevTranslationGuard : TranslationGuard,
      ThemeContextGuard,
      ApplicationDataGuard,
    ],
    resolve: {
      micro: MicroResolver,
      AppLoadedResolver,
    },
    data: {
      microContainerType: MicroContainerTypeEnum.FullScreen,
      i18nDomains: ['builder-app', 'ng-kit-ng-kit'],
      fallback: { ...fallbackTranslations }, // TODO it should not work because translates should be as flaten object
    },
    children: [
      {
        path: 'editor',
        loadChildren: () => import('../../../modules-new/+builder/builder.module').then(m => m.BuilderModule),
      },
      {
        path: 'themes',
        loadChildren: () => import('../../../modules-new/+themes/themes.module').then(m => m.ThemesModule),
      },
      {
        path: 'viewer',
        loadChildren: () => import('../../../modules-new/+viewer/viewer.module').then(m => m.ViewerModule),
      },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class CustomPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    if (route.path === 'themes' || route.path === 'editor' || route.path === 'viewer') {
      // We have to preload to avoid this error:
      //  ERROR Error: Uncaught (in promise): ChunkLoadError: Loading chunk 8 failed.
      //  (missing: https://builder-frontend.staging.devpayever.com/8.js?m29p1AO)
      //  ChunkLoadError: Loading chunk 8 failed.

      return load();
    }

    return EMPTY;
  }
}

@NgModule({
  imports: [RouterModule.forRoot(baseRoute, { preloadingStrategy: CustomPreloadingStrategy })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
