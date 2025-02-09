import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material';
import { RouterModule, Routes } from '@angular/router';

import { ViewerModule as PeViewerModule } from '@pe/builder-editor/projects/modules/viewer/src';
import { MicroContainerTypeEnum } from '@pe/ng-kit/modules/common';
import { DialogModule } from '@pe/ng-kit/modules/dialog';
import { SnackBarModule } from '@pe/ng-kit/modules/snack-bar';
import { ApplicationDataGuard } from '../../apps/builder/app/guards/application-data.guard';
import { NewPlatformHeaderLoaderGuard } from '../core/guards/platform-header.guard';
import { AppLoadedResolver } from '../core/resolvers/app-loaded.resolver';
import { ThemeResolver } from '../core/resolvers/theme.resolver';
import { RootComponent } from './routes/root.component';

export const viewerRoutes: Routes = [
  {
    path: '',
    canActivate: [
      ApplicationDataGuard,
      NewPlatformHeaderLoaderGuard,
    ],
    data: {
      microContainerType: MicroContainerTypeEnum.FullScreen,
      activeHeaderView: 'details',
      loadHeaderAsync: true,
    },
    resolve: {
      theme: ThemeResolver,
      AppLoadedResolver,
    },
    component: RootComponent,
    children: [
      {
        path: '**',
        component: RootComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(viewerRoutes),
    PeViewerModule,
    MatButtonModule,
    DialogModule,
    SnackBarModule,
  ],
  declarations: [RootComponent],
  entryComponents: [],
})
export class ViewerModule {}
