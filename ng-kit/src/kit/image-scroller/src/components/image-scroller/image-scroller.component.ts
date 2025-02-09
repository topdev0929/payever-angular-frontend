import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';

import { BackgroundService } from '../../../../wallpaper';
import { BlobCreateResponse, MediaContainerType, MediaService, MediaUrlPipe } from '../../../../media';
import { peVariables } from '../../../../pe-variables';
import { SnackBarService } from '../../../../snack-bar';
import { TranslateService } from '../../../../i18n';

@Component({
  selector: 'pe-image-scroller',
  templateUrl: './image-scroller.component.html',
  styleUrls: ['./image-scroller.component.scss']
})
export class ImageScrollerComponent implements AfterViewInit {

  @ViewChild('scrollContainer', { static: true }) scrollContainer: ElementRef<HTMLElement>;
  @ViewChild('fileSelector', { static: true }) fileSelector: ElementRef;

  @Input() businessUuid: string;
  @Input() mediaContainer: MediaContainerType;
  @Input() imageNamePostfix: string = '';

  @Input() imagesArray: any[] = [];
  get images(): any[] {
    return this.imagesArray;
  }
  @Input()
  set images(images: any[]) {
    if (images) {
      this.backgroundService.preloadImages(images.map(imageBlobName => {
        return this.mediaUrlPipe.transform(imageBlobName, this.mediaContainer) + this.imageNamePostfix;
      })).subscribe(null, null, () => {
        this.imagesArray = images;
        this.calculateImagesWrapperWidth();
        this.loading = false;
      });
    } else {
      this.imagesArray = [];
      this.calculateImagesWrapperWidth();
      this.loading = false;
    }
  }

  selectedImage: any;
  @Input() get selected(): any { return this.selectedImage; }
  set selected(newValue: any) {
    if (newValue !== this.selectedImage) {
      this.selectedImage = newValue;
    }
  }
  @Output() readonly selectedChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() uploadAvailable: boolean = false;
  @Input() uploadMessageText: string = this.translateService.translate('ng_kit.image_scroller.upload_message_text');
  @Input() uploadQuestionText: string = this.translateService.translate('ng_kit.image_scroller.upload_question_text');
  @Input() uploadButtonText: string = this.translateService.translate('ng_kit.image_scroller.upload_button_text');
  @Input() uploadThumbnailText: string = this.translateService.translate('ng_kit.image_scroller.upload_thumbnail_text');
  @Input() uploadEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() uploadRequestSuccess: EventEmitter<string> = new EventEmitter<string>();
  @Output() uploadRequestSuccessEx: EventEmitter<BlobCreateResponse> = new EventEmitter<BlobCreateResponse>();
  @Output() uploadRequestError: EventEmitter<HttpErrorResponse> = new EventEmitter<HttpErrorResponse>();

  @Input() deleteAvailable: boolean = false;
  @Output() deleteRequestSuccess: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteRequestError: EventEmitter<HttpErrorResponse> = new EventEmitter<HttpErrorResponse>();

  loading: boolean = true;
  imagesWidth: number;
  uploadingInProgress: boolean = false;
  uploadingImage: any;
  spinnerMode: ProgressSpinnerMode = 'determinate';
  spinnerDiameter: number = peVariables.toNumber('spinnerStrokeXs');
  spinnerStrokeWidth: number = peVariables.toNumber('spinnerStrokeWidth');
  uploadProgress: number = 0;
  private mediaService: MediaService = this.injector.get(MediaService);

  private readonly DEFAULT_MAX_IMAGE_SIZE: number = 5242880; // 5mb
  private readonly DEFAULT_MAX_IMAGE_SIZE_TEXT: string = '5MB';

  constructor(private injector: Injector,
              private cdRef: ChangeDetectorRef,
              private snackBarService: SnackBarService,
              private translateService: TranslateService,
              private backgroundService: BackgroundService,
              private mediaUrlPipe: MediaUrlPipe) {}

  get maxFileSize(): number {
    return this.DEFAULT_MAX_IMAGE_SIZE;
  }

  get maxFileSizeText(): string {
    return this.DEFAULT_MAX_IMAGE_SIZE_TEXT;
  }

  ngAfterViewInit(): void {
    this.addMouseWheelListener();

    this.uploadEmitter.subscribe(() => {
      const element: HTMLElement = this.fileSelector.nativeElement as HTMLElement;
      element.click();
    });
  }

  onImageSelect(image: any): void {
    this.selected = image;
    this.selectedChange.emit(image);
  }

  uploadImage(event: Event): void {
    const fileInput: HTMLInputElement = event.target as HTMLInputElement;
    const file: File = fileInput.files[0];

    if ( !file.type.startsWith(`image/`) ) {
      this.fileSelector.nativeElement.value = null;
      this.snackBarService.show(this.translateService.translate('ng_kit.forms.error.image_picker.wrong_type'));
      return;
    }

    if ( !this.isFileSizeValid(file) ) {
      this.fileSelector.nativeElement.value = null;
      this.snackBarService.show(this.translateService.translate('ng_kit.forms.error.image_picker.max_size', {size: this.maxFileSizeText}));
      return;
    }

    if (this.businessUuid && this.mediaContainer) {
      this.spinnerMode = 'determinate';
      this.uploadProgress = 0;
      this.uploadingInProgress = true;
      const reader: FileReader = new FileReader();
      reader.onload = (event: any) => {
        this.uploadingImage = event.target.result;
      };
      reader.readAsDataURL(file);
      this.postImageBlob(file).subscribe(
        (blobCreateResponseHttpEvent: HttpEvent<BlobCreateResponse>) => {
          switch (blobCreateResponseHttpEvent.type) {
            case HttpEventType.UploadProgress: {
              this.uploadProgress = Number(((blobCreateResponseHttpEvent.loaded * 99) / blobCreateResponseHttpEvent.total).toFixed(0));
              this.cdRef.detectChanges();
              break;
            }

            case HttpEventType.Response: {
              if (!blobCreateResponseHttpEvent.body.blobName) {
                throw new Error('Cannot extract blobName from response');
              }
              this.uploadProgress = 100;
              setTimeout(
                () => {
                  this.uploadRequestSuccess.emit(blobCreateResponseHttpEvent.body.blobName);
                  this.uploadRequestSuccessEx.emit(blobCreateResponseHttpEvent.body);
                  this.imagesArray.unshift(blobCreateResponseHttpEvent.body.blobName);
                  this.calculateImagesWrapperWidth();
                  this.uploadingInProgress = false;
                  this.uploadingImage = null;
                },
                1000
              );
              break;
            }

            default: break;
          }
        },
        (error: HttpErrorResponse) => {
          this.snackBarService.show(error.message);
          this.uploadRequestError.emit(error);
          this.uploadingInProgress = false;
          this.uploadingImage = null;
        }
      );
    }
  }

  deleteImage(event: Event, image: string): void {
    event.stopPropagation();
    if (this.businessUuid && this.mediaContainer && image && this.deleteAvailable) {
      this.spinnerMode = 'indeterminate';
      this.deleteImageBlob(image).subscribe(
        () => {
          const id: number = this.imagesArray.findIndex((item: string) => {
            return item === image;
          });
          this.deleteRequestSuccess.emit(image);
          this.imagesArray.splice(id, 1);
          this.calculateImagesWrapperWidth();
        },
        (error: HttpErrorResponse) => {
          this.snackBarService.show(error.error.message || error.message);
          this.deleteRequestError.emit(error);
        }
      );
    }
  }

  private postImageBlob(file: File): Observable<HttpEvent<BlobCreateResponse>> {
    return this.mediaService.createBlobByBusiness(this.businessUuid, this.mediaContainer, file);
  }

  private deleteImageBlob(blobName: string): Observable<void> {
    return this.mediaService.deleteBlobByBusiness(this.businessUuid, this.mediaContainer, blobName);
  }

  private isFileSizeValid(file: File): boolean {
    return file.size <= this.maxFileSize;
  }

  private calculateImagesWrapperWidth(): void {
    const itemsCount: number = (this.imagesArray ? this.imagesArray.length : 0) + (this.uploadAvailable ? 1 : 0);
    this.imagesWidth = itemsCount <= 2 ? (2 * 215) : (Math.ceil(itemsCount / 2 ) * 215);
  }

  private addMouseWheelListener(): void {
    this.scrollContainer.nativeElement.addEventListener('wheel', function(event: MouseWheelEvent): void {
      let modifier: number;
      if (event.deltaMode === event.DOM_DELTA_PIXEL) {
        modifier = 1;
      } else if (event.deltaMode === event.DOM_DELTA_LINE) {
        modifier = parseInt(getComputedStyle(this).lineHeight);
      } else if (event.deltaMode === event.DOM_DELTA_PAGE) {
        modifier = this.clientHeight;
      }
      if (event.deltaY !== 0) {
        this.scrollLeft += modifier * event.deltaY;
        event.preventDefault();
      }
    });
  }
}
