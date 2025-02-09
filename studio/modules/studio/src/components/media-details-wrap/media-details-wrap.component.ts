import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpEvent, HttpResponse } from '@angular/common/http';
import { filter } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { StudioApiService } from '../../core/services/studio-api.service';
import { UploadMediaService } from '../../core/services/uploadMedia.service';
import { PeStudioMedia } from '../../core/interfaces/studio-media.interface';


@Component({
  selector: 'pe-media-details-wrap',
  templateUrl: './media-details-wrap.component.html',
  styles: [],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaDetailsWrapComponent implements OnInit {
  data;
  form: FormGroup;
  panelOpenState: boolean;
  private uploadingMedia: string;
  uploaded = false;
  imagePreview: string;
  @ViewChild('imagePreview') imageElement: ElementRef;

  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public detailImageData: PeStudioMedia,
    private studioApiService: StudioApiService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private destroy: PeDestroyService,
    private uploadMediaService: UploadMediaService,
  ) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      test: [],
      test1: [],
    });
    const businessId = this.detailImageData.business;
    const mediaId = (this.detailImageData._id) ? this.detailImageData._id : this.activatedRoute.snapshot.params.mediaId;
    this.studioApiService.getUserSubscriptionMediaById(businessId, mediaId).subscribe();
  }

  uploadMedia(event: Event): void {
    const fileInput: HTMLInputElement = event.target as HTMLInputElement;
    const files: File[] = Array.from(fileInput.files);
    files.forEach((file: File, index: number) => {
      const reader: FileReader = new FileReader();
      const businessId = this.detailImageData.business;
      reader.onloadend = (onLoadEvent: ProgressEvent<FileReader>) => {
        this.uploadingMedia = onLoadEvent.target.result as string;
        this.uploadMediaService.postMediaBlob(file, businessId)
          .pipe(filter((e: HttpEvent<any>): e is HttpResponse<any> => e instanceof HttpResponse))
          .subscribe(response => {
            this.uploadMediaService.createUserMedia(businessId, response, file).subscribe(image => {
              this.imageElement.nativeElement.style.backgroundImage = `url(${image.url})`;
            });
          });


      };
      reader.readAsDataURL(file);
      this.uploaded = true;
    });

  }
}
