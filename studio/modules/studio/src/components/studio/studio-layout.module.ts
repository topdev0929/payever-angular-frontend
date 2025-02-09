import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatTreeModule } from '@angular/material/tree';
import { CdkTreeModule } from '@angular/cdk/tree';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { PeSidebarModule } from '@pe/sidebar';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeDataGridModule } from '@pe/data-grid';
import { OverlayWidgetModule } from '@pe/overlay-widget';
import { I18nModule } from '@pe/i18n';
import { PeFiltersModule } from '@pe/filters';

import { PeMyMediaComponent } from './my-media/pe-my-media.component';
import { PePreviewComponent } from './my-media/preview/pe-preview.component';
import { PeStudioGridComponent } from './grid/grid.component';
import { MediaDetailsWrapComponent } from '../media-details-wrap/media-details-wrap.component';
import { DragDirective } from '../../directives/drag-and-drop.directive';
import { UploaderComponent } from './uploader/uploader.component';
import { StudioEnvService } from '../../core/services/studio-env.service';
import { PipeModule } from '../../core/pipes/pipe/pipe.module';
import { PeStudioGridUiComponent } from './grid/grid-ui.component';

import {
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PePickerModule,
  PebSelectModule,
  PebButtonToggleModule
} from '@pe/ui';
import { PeContextMenuComponent } from './grid/context-menu/context-menu.component';
import { EditFolderComponent } from '../edit-folder/edit-folder.component';
import { EditPictureComponent } from '../editor-pictures/edit-picture.component';
import { MediaModule, MediaUrlPipe } from '@pe/media';
import { EditItemComponent } from '../edit-item/edit-item.component';
import { ConfirmDialogService } from '../dialogs/dialog-data.service';
import { DialogDataExampleDialogComponent } from '../dialogs/dialog-data.component';
import { SnackBarModule } from '@pe/forms-core';
import { PeAddFieldComponent } from './my-media/preview/add-field/add-fields.component';

export const i18n = I18nModule.forRoot();
@NgModule({
  declarations: [
    PeMyMediaComponent,
    PeAddFieldComponent,
    DialogDataExampleDialogComponent,
    PePreviewComponent,
    PeStudioGridComponent,
    MediaDetailsWrapComponent,
    DragDirective,
    UploaderComponent,
    PeStudioGridUiComponent,
    PeContextMenuComponent,
    EditFolderComponent,
    EditPictureComponent,
    EditItemComponent
  ],
  imports: [
    CommonModule,
    SnackBarModule,
    MatProgressSpinnerModule,
    PeDataGridModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatButtonModule,
    MatExpansionModule,
    ReactiveFormsModule,
    MatInputModule,
    PebButtonToggleModule,
    MatFormFieldModule,
    PebSelectModule,
    MatChipsModule,
    MatIconModule,
    PebExpandablePanelModule,
    MediaModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebFormFieldTextareaModule,
    PePickerModule,
    NgScrollbarModule,
    PeSidebarModule,
    PePlatformHeaderModule,
    PeDataGridModule,
    OverlayWidgetModule,
    MatTreeModule,
    CdkTreeModule,
    MatExpansionModule,
    PePlatformHeaderModule,
    FormsModule,
    DragDropModule,
    i18n,
    PeFiltersModule,
    PipeModule,
  ],
  entryComponents: [
    PePreviewComponent,
    PeContextMenuComponent,
    DialogDataExampleDialogComponent
  ],
  providers: [
    DragDirective,
    MediaUrlPipe,
    StudioEnvService,
    ConfirmDialogService

  ],
})
export class StudioLayoutModule { }
