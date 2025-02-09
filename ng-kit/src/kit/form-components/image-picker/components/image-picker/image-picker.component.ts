import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, Input, ViewEncapsulation, Injector, EventEmitter, Output, ChangeDetectorRef, ViewChild, Inject, ElementRef } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';

import { MediaService, BlobCreateResponse, MediaContainerType } from '../../../../media';
import { peVariables } from '../../../../pe-variables';
import { AbstractFieldComponent } from '../../../../form-core/components/abstract-field';
import { ImageUploadService } from '../../services';
import { DescriptionAlignment, ImagePickerStyle, ImagePickerAlignment } from '../../enums';
import { ImagePickerChangeEvent } from '../../interfaces';

@Component({
  selector: 'pe-image-picker',
  templateUrl: 'image-picker.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ImagePickerComponent extends AbstractFieldComponent {

  @Input() alignment: ImagePickerAlignment = ImagePickerAlignment.Left;
  @Input() businessUuid: string;
  @Input() container: MediaContainerType;
  @Input() description: string;
  @Input() uploadProgress: number = 0;
  @Input() descriptionAlignment: DescriptionAlignment = DescriptionAlignment.Left;
  @Input() label: string;
  @Input() loading: boolean;
  @Input() placeholder: string;
  @Input() preventDeleteRequest: boolean;
  @Input() style: ImagePickerStyle = ImagePickerStyle.Round;

  @Output() deleteRequestError: EventEmitter<HttpErrorResponse> = new EventEmitter<HttpErrorResponse>();
  @Output() uploadRequestError: EventEmitter<HttpErrorResponse> = new EventEmitter<HttpErrorResponse>();
  @Output() valueChange: EventEmitter<ImagePickerChangeEvent> = new EventEmitter<ImagePickerChangeEvent>();

  @ViewChild('fileSelector') fileSelector: ElementRef;

  get spinnerDiameter(): number {
    return this.style === ImagePickerStyle.Round ? peVariables.toNumber('spinnerStrokeXxs') : peVariables.toNumber('spinnerStrokeSm');
  }

  tooltipText: string;
  spinnerMode: ProgressSpinnerMode = 'determinate';
  spinnerStrokeWidth: number = peVariables.toNumber('spinnerStrokeWidth');

  private mediaService: MediaService = this.injector.get(MediaService);

  constructor(protected injector: Injector,
              private cdRef: ChangeDetectorRef,
              private http: HttpClient,
              private imageUploadService: ImageUploadService) {
    super(injector);
  }

  pickImage(event: Event): void {
    const fileInput: HTMLInputElement = event.target as HTMLInputElement;
    const file: File = fileInput.files[0];

    if (this.imageUploadService.checkImage(file, true)) {
      if (this.businessUuid && this.container) {
        this.spinnerMode = 'determinate';
        this.loading = true;
        this.imageUploadService.uploadImage({
          file,
          businessId: this.businessUuid,
          container: this.container,
          checkImage: false,
          showErrors: false
        }).subscribe((event: HttpEvent<BlobCreateResponse>) => {
          switch (event.type) {
            case HttpEventType.UploadProgress: {
              this.uploadProgress = this.imageUploadService.getProgressFromEvent(event);
              this.cdRef.detectChanges();
              break;
            }
            case HttpEventType.Response: {
              const blobName: string = this.imageUploadService.getBlobNameFromEvent(event);
              this.formControl.setValue(blobName);
              this.onValueChange(file, blobName);
              this.loading = false;
              break;
            }
            default: break;
          }
        });
      } else {
        this.onValueChange(file);
      }
    } else {
      this.fileSelector.nativeElement.value = null;
    }
  }

  clearImage(): void {
    if (this.businessUuid && this.container && this.formControl.value && !this.preventDeleteRequest) {
      this.spinnerMode = 'indeterminate';
      this.loading = true;
      this.imageUploadService.deleteImage(this.formControl.value, this.businessUuid, this.container).subscribe(
        () => {
          this.formControl.setValue(null);
          this.onValueChange(null);
          this.loading = false;
        },
        (error: HttpErrorResponse) => {
          this.formControl.setValue(null);
          this.deleteRequestError.emit(error);
          this.loading = false;
        }
      );
    } else {
      this.formControl.setValue(null);
      this.onValueChange(null);
    }
  }

  checkIsImageUrl(url: string): boolean {
    return /^.*(jpeg|jpg|png|gif|bmp)$/.test(url);
  }

  private onValueChange(file?: File, blobName?: string): void {
    this.valueChange.emit({ file, blobName });
  }

}
