import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxsModule } from '@ngxs/store';

import { PeAppEnv } from '@pe/app-env';
import { PebWebsocketService } from '@pe/builder/api';
import { PebEditorState, PebElementsState, PebPagesState, PebScriptsState, PebShapesState, PebUndoState } from '@pe/builder/state';
import { PeBuilderAppModule } from '@pe/builder-app';
import { APP_TYPE, AppType } from '@pe/common';

import { PeBlogEnv } from './blog-env.service';
import { PeBlogRoutingModule } from './blog-routing.module';


@NgModule({
  imports: [
    CommonModule,
    PeBuilderAppModule,
    PeBlogRoutingModule,
    NgxsModule.forFeature([
      PebEditorState,
      PebPagesState,
      PebElementsState,
      PebUndoState,
      PebScriptsState,
      PebShapesState,      
    ]),
  ],
  providers: [
    MatDialog,
    {
      provide: PeAppEnv,
      useClass: PeBlogEnv,
    },
    {
      provide: PebWebsocketService,
      useClass: PebWebsocketService,
      deps: [PeAppEnv],
    },
    {
      provide: APP_TYPE,
      useValue: AppType.Blog,
    },
  ],
})
export class PeBlogModule {
}
