import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { findIndex } from 'lodash-es';
import { DragulaService } from 'ng2-dragula';
import { finalize, takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { MediaService, MediaUrlPipe } from '@pe/media';
import { SnackbarService } from '@pe/snackbar';

import { mimeTypes } from '../../../shared/interfaces/section.interface';
import {
  ImagesUploaderService,
  UploadEvent,
  UploadEventTypeEnum,
  UploadProgressEvent,
  UploadResultEvent,
} from '../../../shared/services/images-uploader.service';


const MAX_IMAGES_COUNT = 15;
const DEFAULT_MAX_IMAGE_SIZE = 5242880; // 5mb

@Component({
  selector: 'editor-pictures',
  templateUrl: 'editor-pictures.component.html',
  styleUrls: ['editor-pictures.component.scss'],
  providers: [
    MediaUrlPipe,
    PeDestroyService,
  ],
})
export class EditorPicturesComponent implements OnInit {
  @Input() set blobs(images: string[]) {
    this.pictures = images.slice();
  }

  @Input()
  dragulaBag: string;

  @Output()
  changePictures: EventEmitter<string[]> = new EventEmitter<string[]>();

  @Output()
  loadingStateChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('pictureUploader')
  imageFileInput: ElementRef;

  isDragging = false;
  previewImage: string = null;
  pictures: string[] = [];
  loading = false;

  uploadProgress: number;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private mediaService: MediaService,
    private snackBarService: SnackbarService,
    private translateService: TranslateService,
    private imagesUploaderService: ImagesUploaderService,
  ) {
  }

  get previewImageUrl(): string {
    return this.mediaService.getMediaUrl(this.previewImage || this.pictures[0], 'products');
  }

  ngOnInit(): void {
    this.updateProductPictures();
  }

  changePreview(img: string): void {
    this.previewImage = img;
  }

  drop(event: CdkDragDrop<any>) {
    this.pictures[event.previousContainer.data.index] = event.container.data.img;
    this.pictures[event.container.data.index] = event.previousContainer.data.img;
    this.previewImage = this.pictures[0];
    this.updateProductPictures();
  }

  onFileOver(isDragging: boolean): void {
    this.isDragging = isDragging;
  }

  onFileDrop(files: FileList): void {
    this.isDragging = false;
    this.addPicturesToProduct(Array.from(files));
  }

  onFileChange(evt: Event): void {
    this.addPicturesToProduct(Array.from<File>((evt.target as HTMLInputElement).files));

    if (this.imageFileInput?.nativeElement) {
      this.imageFileInput.nativeElement.value = null;
    }
  }

  deleteImage(blobName: string): void {
    const blobIndex: number = this.pictures.indexOf(blobName);
    this.pictures.splice(blobIndex, 1);
    if (blobName === this.previewImage) {
      this.previewImage = this.pictures[0];
    }
    this.updateProductPictures();
  }

  private addPicturesToProduct(files: File[]): void {
    const validFiles = this.getValidFiles(files);

    if (!validFiles.length) {
      return;
    }

    this.loading = true;

    this.loadingStateChanged.emit(true);

    this.imagesUploaderService
      .uploadImages(validFiles)
      .pipe(
        finalize(() => {
          this.loadingStateChanged.emit(false);
        }),
      )
      .subscribe((event: UploadEvent<UploadProgressEvent | UploadResultEvent>) => {
        switch (event.type) {
          case UploadEventTypeEnum.RESULT: {
            const res: UploadResultEvent = event.data as UploadResultEvent;
            this.uploadProgress = 0;
            this.pictures.push(res.lastUploadedImage.url);
            this.previewImage = this.pictures[this.pictures.length - 1];
            this.loading = false;
            this.updateProductPictures();
            break;
          }
          case UploadEventTypeEnum.PROGRESS: {
            this.uploadProgress = (event.data as UploadProgressEvent).currentProgress;
            this.changeDetectorRef.detectChanges();
            break;
          }
          default:
            break;
        }
      });
  }

  private getValidFiles(files: File[]): File[] {
    const matchRegExp = new RegExp(`^image/(${mimeTypes})`);
    const availableImagesCount = MAX_IMAGES_COUNT - this.pictures.length;
    const validFiles = [];

    for (const file of files) {
      if (validFiles.length === availableImagesCount) {
        this.showWarning(
          this.translateService.translate('pictures.errors.max_count', {
            maxCount: MAX_IMAGES_COUNT,
          }),
        );

        break;
      }

      if (this.isFileSizeInvalid(file)) {
        this.showWarning(`${file.name}: ${this.translateService.translate('pictures.errors.image_size')}`);
      } else if (!matchRegExp.exec(file.type)) {
        this.showWarning(`${file.name}: ${this.translateService.translate('pictures.errors.non_image_file')}`);
      } else {
        validFiles.push(file);
      }
    }

    return validFiles;
  }

  private isFileSizeInvalid(file: File): boolean {
    return file.size > DEFAULT_MAX_IMAGE_SIZE;
  }

  private showWarning(notification: string): void {
    this.snackBarService.toggle(true, {
      content: notification,
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }

  private updateProductPictures(): void {
    this.changePictures.emit(this.pictures);
  }
}
