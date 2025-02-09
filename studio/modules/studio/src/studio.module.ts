import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTreeModule } from '@angular/material/tree';
import { HttpClientModule } from '@angular/common/http';
import { NgxsModule } from '@ngxs/store';

import { PeDataGridModule } from '@pe/data-grid';
import { PeSidebarModule } from '@pe/sidebar';
import { OverlayWidgetModule } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeAuthService } from '@pe/auth';

import { PreviewComponent } from './components/preview/preview.component';

import { PeStudioComponent } from './studio.component';
import { PeStudioRoutingModule } from './studio.routing.module';
import { StudioCollapseComponent } from './ui-components/collapse/collapse.component';
import { StudioSelectComponent } from './ui-components/studio-select/studio-select.component';
import { UploadMediaComponent } from './components/shared/upload-media/upload-media.component';
import { StudioLayoutModule } from './components/studio/studio-layout.module';
import { StudioAppState } from './core/store/studio.app.state';
import { DataGridItemsService } from './core/services/data-grid-items.service';
import { PipeModule } from './core/pipes/pipe/pipe.module';
import { AbstractComponent } from './core';
import { StudioGridGuard } from './guards/studio-grid.guard';
import { MediaModule, MediaUrlPipe } from '@pe/media';

export const ngxsFeatureModule = NgxsModule.forFeature([StudioAppState]);

@NgModule({
  imports: [
    CommonModule,
    PeStudioRoutingModule,
    StudioLayoutModule,
    MatProgressSpinnerModule,
    PePlatformHeaderModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatIconModule,
    HttpClientModule,
    NgScrollbarModule,
    PeSidebarModule,
    PeDataGridModule,
    OverlayWidgetModule,
    PePlatformHeaderModule,
    MatExpansionModule,
    MatTreeModule,
    ngxsFeatureModule,
    PipeModule,
    MediaModule
  ],
  declarations: [
    PeStudioComponent,
    PreviewComponent,
    UploadMediaComponent,
    AbstractComponent,

    // UI components. Replace in own module in future
    StudioSelectComponent,
    StudioCollapseComponent,
  ],
  providers: [
    DataGridItemsService,
    StudioGridGuard,
    MediaUrlPipe,
    PeAuthService,

  ],
})
export class PeStudioModule {
}
