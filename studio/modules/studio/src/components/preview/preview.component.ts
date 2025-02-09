import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { MediaDetails, MediaViewEnum } from '../../core/interfaces/media-details.model';
import { StudioApiService } from '../../core/services/studio-api.service';


@Component({
  selector: 'pe-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewComponent implements OnInit {

  detailsActive: boolean;
  renameMediaActive: boolean;
  mode: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MediaDetails,
    private studioApiService: StudioApiService,
    public dialogRef: MatDialogRef<PreviewComponent>,
    private router: Router,
  ) {
    this.mode = this.data.mediaView === MediaViewEnum.allMedia ? 'subscription' : 'media';
  }

  ngOnInit(): void {
    if (window.location.pathname.split('/')[6]?.includes('edit')) {
      this.renameMediaActive = true;
    } else {
      this.renameMediaActive = false;
    }
  }

  handleCloseRenameForm(): void {
    this.router.navigateByUrl(`/business/${this.data.businessId}/studio/${this.mode}/${this.data.media._id}`);
  }

  handleClosePreviewForm(): void {
    this.dialogRef.close();
  }

  handleRenameMedia(name): void {
    this.data.media.name = name;
  }

  onToggleDetails(): void {
    this.detailsActive = !this.detailsActive;
    this.renameMediaActive = false;
  }

  onToggleRename(): void {
    this.router.navigateByUrl(`/business/${this.data.businessId}/studio/media/${this.data.media._id}/edit`);
  }

  onToggleMoveTo(): void {
  }

  downloadMedia(url: string): void {
    this.studioApiService.downloadMedia(url);
  }
}
