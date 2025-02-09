import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MicroContainerTypeEnum } from '@pe/ng-kit/modules/common';
import { NewPlatformHeaderLoaderGuard } from '../core/guards/platform-header.guard';
import { AppLoadedResolver } from '../core/resolvers/app-loaded.resolver';
import { FeatureFlagsResolver } from '../core/resolvers/feature-flags.resolver';
import { BuilderPageComponent } from './root/page.component';
import { BuilderThemeComponent } from './root/theme.component';
import { BuilderThemeResolver } from './root/theme.resolver';
import { ThemeContextInitGuard, ThemeContextResetGuard } from './utils/context.store';

export const builderRoutes: Routes = [
  {
    path: '',
    data: {
      microContainerType: MicroContainerTypeEnum.FullScreen,
      activeHeaderView: 'details', // need to activate button with shop/terminal name in header
      loadHeaderAsync: true, // need for PlatformHeaderLoaderGuard
    },
    canActivate: [
      ThemeContextInitGuard,
      NewPlatformHeaderLoaderGuard,
    ],
    resolve: {
      theme: BuilderThemeResolver,
      AppLoadedResolver,
      FeatureFlagsResolver,
    },
    canDeactivate: [
      ThemeContextResetGuard,
    ],
    component: BuilderThemeComponent,
    children: [
      { path: '**', component: BuilderPageComponent },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(builderRoutes),
  ],
  exports: [RouterModule],
})
export class BuilderRoutingModule {}
