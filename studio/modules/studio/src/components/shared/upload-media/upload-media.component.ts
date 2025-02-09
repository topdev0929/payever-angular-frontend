import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';
import { HttpErrorResponse, HttpEvent, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { UploadMediaService } from '../../../core/services/uploadMedia.service';
import { MediaViewEnum } from '../../../core/interfaces/media-details.model';
import { PeStudioMedia } from '../../../core/interfaces/studio-media.interface';
import { DataGridItemsService } from '../../../core/services/data-grid-items.service';


@Component({
  selector: 'pe-studio-upload-media',
  templateUrl: './upload-media.component.html',
  styleUrls: ['./upload-media.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadMediaComponent implements OnInit {
  @ViewChild('fileSelector') fileSelector: ElementRef;
  private uploadingMedia: string | ArrayBuffer;
  private businessId: string;
  private files: File[];
  private mediaView: MediaViewEnum | string;
  private albumId: string;

  constructor(
    public dialogRef: MatDialogRef<UploadMediaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private uploadMediaService: UploadMediaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataGridItemsService: DataGridItemsService,
  ) {
  }

  handleClose(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.businessId = this.router.url.split('business/')[1].split('/studio')[0];

    this.mediaView = (this.data?.albumId) ? this.data.albumId : MediaViewEnum.ownMedia;
  }

  uploadMedia(event): void {
    const fileInput: HTMLInputElement = event.target as HTMLInputElement;
    this.files = Array.from(fileInput.files);

    this.files.forEach((file: File, index: number) => {
      const reader: FileReader = new FileReader();
      reader.onload = (onLoadEvent: ProgressEvent<FileReader>) => {
        this.uploadingMedia = onLoadEvent.target.result;
        this.uploadMediaService.postMediaBlob(file, this.businessId)
          .pipe(filter((e: HttpEvent<any>): e is HttpResponse<any> => e instanceof HttpResponse ))
          .subscribe(response => {

              this.uploadMediaService.createUserMedia(this.businessId, response, file)
                .subscribe((peStudioMedia: PeStudioMedia) => {
                  this.uploadMediaService.addAlbumMedia(this.businessId, [peStudioMedia._id], this.data.albumId)
                    .subscribe();
                  this.dataGridItemsService.addStudioMediaToList(peStudioMedia);
                }).add( () => { this.handleClose(); });
            },
            (error: HttpErrorResponse) => {

            });
      };
      reader.readAsDataURL(file);
    });
  }
}
