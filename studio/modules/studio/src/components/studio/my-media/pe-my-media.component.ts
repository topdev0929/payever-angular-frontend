import { Component, Inject, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';

import { StudioApiService } from '../../../core/services/studio-api.service';
import { MediaViewEnum } from '../../../core/interfaces/media-details.model';
import { PePreviewComponent } from './preview/pe-preview.component';
import { PeStudioMedia } from '../../../core/interfaces/studio-media.interface';
import { DataGridItemsService } from '../../../core/services/data-grid-items.service';
import { AbstractComponent } from '../../../core';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'pe-my-media',
  templateUrl: './pe-my-media.component.html',
  styleUrls: ['./pe-my-media.component.scss'],
  providers: [PeOverlayWidgetService]
})
export class PeMyMediaComponent extends AbstractComponent implements OnInit {
  image$: Observable<PeStudioMedia>;
  theme: string;
  mediaView = MediaViewEnum.allMedia;
  mediaEnum = MediaViewEnum;
  saveSubject$ = new BehaviorSubject(null);
  constructor(
    private mediaService: StudioApiService,
    private overlay: PeOverlayWidgetService,
    @Inject(MAT_DIALOG_DATA) public mediaData,
    private gridItemService: DataGridItemsService,
    private dialog: MatDialogRef<PeMyMediaComponent>,

  ) {
    super();
    this.saveSubject$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data === 'saved'){
        this.overlay.close();
      }
    });
  }

  ngOnInit(): void {
    this.mediaView = this.mediaData.mediaView;
    this.theme = this.mediaData.theme;

    if (this.mediaData.mediaView === MediaViewEnum.allMedia) {
      this.image$ = this.mediaService.getSubscriptionMediaById(this.mediaData.businessId, this.mediaData.id);
    } else {
      this.image$ = this.mediaService.getUserSubscriptionMediaById(this.mediaData.businessId, this.mediaData.id);
    }
  }
  openPreviewDialog(): void {
    this.image$.subscribe(image => {
      const config: PeOverlayConfig = {
        hasBackdrop: true,
        component: PePreviewComponent,
        data: { ...image, theme: this.theme },
        backdropClass: 'settings-backdrop',
        panelClass: 'settings-widget-panel',
        headerConfig: {
          title: 'Image Details',
          backBtnTitle: 'Cancel',
          removeContentPadding: true,
          onSaveSubject$: this.saveSubject$,
          theme: this.theme,
          backBtnCallback: () => { this.overlay.close(); },
          cancelBtnTitle: '',
          cancelBtnCallback: () => { },
          doneBtnTitle: 'Done',
        }
      };

      this.overlay.open(
        config
      );
    });
  }
  downloadImage(): void {
    this.image$.subscribe(image => {
      this.mediaService.downloadMedia(this.getMediaUrl(image));
    });
  }

  getMediaUrl = (image) => {
    return  image.url.split('_preview')[0];
  }

  close(): void {
    this.dialog.close();
  }

  getItem(): void {
    this.gridItemService.addMediaToDownloaded(this.mediaData.id).subscribe(data => {
      this.overlay.close();
    });
  }
}
