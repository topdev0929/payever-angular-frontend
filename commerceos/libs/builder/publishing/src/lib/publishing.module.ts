import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PebRendererModule } from '@pe/builder/renderer';
import { PeDataGridModule } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import { I18nModule } from '@pe/i18n';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';
import { PebButtonModule } from '@pe/ui';

import { PebEditorPublishDialogComponent } from './publish-dialog/publish-dialog.component';
import { PebReviewPublishComponent } from './review-publish.component';

@NgModule({
  imports: [
    CommonModule,
    PeDataGridModule,
    PeFiltersModule,
    PeSidebarModule,
    PePlatformHeaderModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PebRendererModule,
    PebButtonModule,
    MatFormFieldModule,
    MatChipsModule,
    I18nModule,
  ],
  declarations: [PebEditorPublishDialogComponent, PebReviewPublishComponent],
  exports: [PebEditorPublishDialogComponent, PebReviewPublishComponent],
})
export class PebPublishingModule {}
