import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';

import { PebBackgroundActivityModule } from '@pe/builder/background-activity';
import { PebControlsModule, PebMoveService, PebSelectionBBoxState } from '@pe/builder/controls';
import { PebAutoHideScrollbarModule } from '@pe/builder/editor-utils';
import { PebEventsService } from '@pe/builder/events';
import { PebLinkService, PebTextFormService } from '@pe/builder/forms';
import { PebLayersModule } from '@pe/builder/layers';
import { PebPageListModule } from '@pe/builder/page-list';
import { PebPagePreviewModule } from '@pe/builder/preview-renderer';
import { PebRendererModule, PebTextEditorModule } from '@pe/builder/renderer';
import { PebEditorIntegrationsStore, PebResizeService } from '@pe/builder/services';
import { PebCreateShapeModule } from '@pe/builder/shapes';
import { PebRightSidebarModule } from '@pe/builder/sidebar';
import { PebClipboardState, PebInspectorState, PebSidebarsState } from '@pe/builder/state';
import { PebDeviceService } from '@pe/common';
import { I18nModule } from '@pe/i18n';


import {
  PebEditorCompileErrorDialog,
  PebEditorIntegrationConnectDialogModule,
  PebEditorLanguagesDialog,
  PebEditorScriptsDialogModule,
} from './dialogs';
import { PebEditorRendererComponent } from './editor-renderer.component';
import { PebEditor } from './editor.component';
import { PebMasterPageToolbarComponent } from './master-page-toolbar/master-page-toolbar.component';
import { PebViewportHandler, PebTextEditHandler, PebControlsHandler } from './services';
import { PebKeyboardHandler } from './services/keyboard.handler';

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    PebControlsModule,
    PebEditorScriptsDialogModule,
    PebEditorIntegrationConnectDialogModule,
    PebRendererModule,
    PebTextEditorModule,
    RouterModule.forChild([
      {
        path: '',
        component: PebEditor,
        children: [
          {
            path: '',
            loadChildren: () => import('@pe/builder/toolbar').then(m => m.PebToolbarModule),
            outlet: 'toolbar',
          },
          {
            path: 'insert',
            loadChildren: () => import('@pe/builder/shapes').then(m => m.PebShapesModule),
          },
          {
            path: 'studio',
            loadChildren: () => import('@pe/builder/media').then(m => m.PebMediaModule),
          },
        ],
      },
    ]),
    ScrollingModule,
    MatChipsModule,
    PebLayersModule,
    PebAutoHideScrollbarModule,
    PebPagePreviewModule,
    PebRightSidebarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    NgxsModule.forFeature([
      PebInspectorState,
      PebSelectionBBoxState,
      PebSidebarsState,
      PebClipboardState,
    ]),
    PebBackgroundActivityModule.forChild(),
    PebPageListModule,
    PebCreateShapeModule,
    I18nModule,
  ],
  declarations: [
    PebEditor,
    PebEditorCompileErrorDialog,
    PebEditorLanguagesDialog,
    PebEditorRendererComponent,
    PebMasterPageToolbarComponent,
  ],
  exports: [
    PebEditor,
  ],
  providers: [
    PebControlsHandler,
    PebDeviceService,
    PebEditorIntegrationsStore,
    PebEventsService,
    PebKeyboardHandler,
    PebLinkService,
    PebTextEditHandler,
    PebTextFormService,
    PebViewportHandler,
  ],
})
export class PebMainEditorModule {
  constructor(
    private readonly controlsHandler: PebControlsHandler,
    private readonly keyboardHandler: PebKeyboardHandler,
    private readonly moveService: PebMoveService,
    private readonly textExitHandler: PebTextEditHandler,
    private readonly viewportHandler: PebViewportHandler,
    private readonly resizeService: PebResizeService,
  ) {
  }
}
