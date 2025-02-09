import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
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
import { finalize, takeUntil } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';
import { MediaService, MediaUrlPipe } from '@pe/media';
import { SnackbarService } from '@pe/snackbar';

import { AbstractComponent } from '../../../misc/abstract.component';
import {
  ImagesUploaderService,
  UploadEvent,
  UploadEventTypeEnum,
  UploadProgressEvent,
  UploadResultEvent,
} from '../../../shared/services/images-uploader.service';
import { mimeTypes } from '../../../shared/interfaces/section.interface';

import { DragulaService } from 'ng2-dragula';

const BUTTONS_MARGIN_SIZE = 2;
const MAX_IMAGES_COUNT = 15;
const DEFAULT_MAX_IMAGE_SIZE = 5242880; // 5mb

@Component({
  selector: 'editor-pictures',
  templateUrl: 'editor-pictures.component.html',
  styleUrls: ['editor-pictures.component.scss'],
  providers: [MediaUrlPipe],
})
export class EditorPicturesComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {
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
  @ViewChild('picturesScroll', { read: ElementRef })
  picturesScroll: ElementRef;
  @ViewChildren('imageContainer', { read: ElementRef })
  imageContainers: QueryList<ElementRef>;

  isDragging = false;
  isDraggingSort = false;
  previewImage: string = null;
  pictures: string[] = [];
  loading = false;
  // spinnerConfig: SpinnerConfig = SpinnerConfig;

  uploadProgress: number;
  imagesStartIndex = 0;
  displayImagesCount = 4;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dragulaService: DragulaService,
    private mediaService: MediaService,
    private snackBarService: SnackbarService,
    private translateService: TranslateService,
    private imagesUploaderService: ImagesUploaderService,
  ) {
    super();
  }

  get previewImageUrl(): string {
    return this.mediaService.getMediaUrl(this.previewImage || this.pictures[0], 'products');
  }

  get isDisabledScrollLeft(): boolean {
    return this.imagesStartIndex === 0;
  }

  get isDisabledScrollRight(): boolean {
    return this.imagesStartIndex + this.displayImagesCount >= this.pictures.length;
  }

  ngOnInit(): void {
    this.dragulaService.createGroup(this.dragulaBag, {
      moves: (el: HTMLElement, container: HTMLElement, handle: HTMLElement) => {
        return handle.className === 'drag-handler';
      },
      removeOnSpill: true,
    });

    this.changePictures.emit(this.pictures);

    this.dragulaService
      .remove(this.dragulaBag)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((group: { name: string; el: Element; container: Element; source: Element }) => {
        const blobName: string = group.el[1].dataset.image.split('/products/')[1];
        this.pictures.splice(findIndex(this.pictures, blobName), 1);
        this.updateProductPictures();
      });
  }

  ngAfterViewInit() {
    // this.windowService.width$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
    //   this.calculateImagesCount();
    // });
  }

  ngOnDestroy(): void {
    this.dragulaService.destroy(this.dragulaBag);
    super.ngOnDestroy();
  }

  changePreview(img: string): void {
    this.previewImage = img;
  }

  onStartSortImg(): void {
    this.isDraggingSort = true;
  }

  onDropSortImg(event: CdkDragDrop<string[]>): void {
    moveItemInArray(
      this.pictures,
      event.previousIndex + this.imagesStartIndex,
      event.currentIndex + this.imagesStartIndex,
    );
    this.isDraggingSort = false;
    this.changePictures.emit(this.pictures);
    this.previewImage = this.pictures[0];
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

    if (this.imageFileInput && this.imageFileInput.nativeElement) {
      this.imageFileInput.nativeElement.value = null;
    }
  }

  deleteImage(blobName: string): void {
    const blobIndex: number = this.pictures.indexOf(blobName);
    this.pictures.splice(blobIndex, 1);
    this.calculateImagesCount();
    if (this.imagesStartIndex !== 0) {
      this.imagesStartIndex--;
    }
    if (blobName === this.previewImage) {
      this.previewImage = this.pictures[0];
    }
    this.updateProductPictures();
  }

  movePrevImage(): void {
    this.imagesStartIndex--;
  }

  moveNextImage(): void {
    this.imagesStartIndex++;
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
          case UploadEventTypeEnum.RESULT:
            const res: UploadResultEvent = event.data as UploadResultEvent;
            this.uploadProgress = 0;
            this.pictures.push(res.lastUploadedImage.url);
            this.previewImage = this.pictures[this.pictures.length - 1];
            this.loading = false;
            this.updateProductPictures();
            this.calculateImagesCount();
            break;
          case UploadEventTypeEnum.PROGRESS:
            this.uploadProgress = (event.data as UploadProgressEvent).currentProgress;
            this.changeDetectorRef.detectChanges();
            break;
          default:
            break;
        }
      });
  }

  private getValidFiles(files: File[]): File[] {
    const matchRegExp: RegExp = new RegExp(`^image\/(${mimeTypes})`);
    const availableImagesCount = MAX_IMAGES_COUNT - this.pictures.length;
    const validFiles = [];

    for (let i = 0; i < files.length; i++) {
      if (validFiles.length === availableImagesCount) {
        this.showWarning(
          this.translateService.translate('pictures.errors.max_count', {
            maxCount: MAX_IMAGES_COUNT,
          }),
        );

        break;
      }

      const file = files[i];

      if (this.isFileSizeInvalid(file)) {
        this.showWarning(`${file.name}: ${this.translateService.translate('pictures.errors.image_size')}`);
      } else if (!file.type.match(matchRegExp)) {
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

  private calculateImagesCount() {
    if (this.imageContainers && this.imageContainers.length && this.picturesScroll) {
      const itemWidth = this.imageContainers.first.nativeElement.clientWidth;
      const containerWidth = this.picturesScroll.nativeElement.clientWidth;
      const imagesCount = Math.floor(containerWidth / itemWidth) - BUTTONS_MARGIN_SIZE;
      this.displayImagesCount = Math.max(1, imagesCount);
      this.changeDetectorRef.detectChanges();
    }
  }
}
