
import {
  ChangeDetectionStrategy, Component, ElementRef,
  EventEmitter, Injector, Input, OnDestroy, Output, TemplateRef, ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { compressAccurately, EImageType } from 'image-conversion';
import CameraPhoto, { FACING_MODES, IMAGE_TYPES } from 'jslib-html5-camera-photo';
import { BehaviorSubject } from 'rxjs';

import { AnalyticActionEnum, AnalyticsFormService } from '@pe/checkout/analytics';
import { SafeUrlPipe } from '@pe/checkout/plugins';
import { CustomElementService } from '@pe/checkout/utils';

import 'regenerator-runtime/runtime.js'; // To fix "regeneratorRuntime is not defined" in pos shop/terminal


const MAX_FILE_SIZE_MB = 15;
const UPLOAD_FILE_SIZE_MB = 1;

export interface PickedFileInterface {
  base64: string;
  fileName?: string;
}

const ANALYTICS_FORM_NAME = 'ADDITIONAL_STEPS';

@Component({
  selector: 'image-capture',
  templateUrl: 'image-capture.component.html',
  styleUrls: ['./image-capture.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SafeUrlPipe],
})
export class ImageCaptureComponent implements OnDestroy {
  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('videoElem') videoElem: ElementRef;
  @ViewChild('fileSelector') fileSelector: ElementRef;

  @Input() icon: string = null;
  @Input() title: string = null;
  @Input() analyticId: string;
  @Input() isFilePicked = false;

  @Output() fileRemove: EventEmitter<void> = new EventEmitter<void>();
  @Output() errorTriggered: EventEmitter<string> = new EventEmitter<string>();
  @Output() filePicked: EventEmitter<PickedFileInterface> = new EventEmitter<PickedFileInterface>();

  // Accessing elements this way is not Angular way. But we are trying to workaround broken camera in cosf.
  public videoElemId = 'posDeVideo4';
  public fileInputId = `pe-file-${String(Math.random()).substr(4)}`;
  public forceHideDesktopTakePhoto = false;
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public isCameraReady$ = new BehaviorSubject<boolean>(false);
  public cameraPhoto: CameraPhoto = null;
  public snapshotBase64: string;

  protected customElementService = this.injector.get(CustomElementService);
  private dialogRef: MatDialogRef<any> = null;
  private matDialog: MatDialog = this.injector.get(MatDialog);
  private analyticsFormService: AnalyticsFormService = this.injector.get(AnalyticsFormService);
  private elementRef: ElementRef = this.injector.get(ElementRef);

  constructor(private injector: Injector) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons([
      'close-16',
      'retro-camera',
      'photo-or-video-16',
      'pick-photo',
      'make-photo',
    ], null, this.customElementService.shadowRoot);
  }

  ngOnDestroy(): void {
    this.closeModal();
  }

  openFilePicker(): void {
    this.fileSelector.nativeElement.value = '';
    const fileInputEl = this.elementRef.nativeElement.querySelector(`#${this.fileInputId}`);
    fileInputEl?.click();
  }

  onPickFile(event: any): void {
    const fileInput: HTMLInputElement = event.target as HTMLInputElement;
    const files: File[] = Array.from(fileInput.files);
    const file = files[0]; // We don't have multiple
    if (file) {
      const tooBig = file.size > MAX_FILE_SIZE_MB * 1024 * 1024;
      if (tooBig) {
        this.errorTriggered.next(
          $localize `:@@payment-santander-de-pos.inquiry.filePicker.errors.tooBigFile:${file.name}:fileName:${MAX_FILE_SIZE_MB}:fileSize:`
        );
      } else {
        this.processFile(file);
      }
    }

    this.analyticsFormService.emitEventForm(
      ANALYTICS_FORM_NAME,
      {
        field: $localize `:@@payment-santander-de-pos.inquiry.filePicker.actions.chooseFile:`,
        action: AnalyticActionEnum.CHANGE,
      },
    );
  }

  onTakePhotoDesktop(): void {
    this.dialogRef = this.matDialog.open(this.modalContent, {
      autoFocus: false,
      disableClose: false,
      panelClass: ['dialog-overlay-panel', 'pe-checkout-bootstrap', 'pe-checkout-pos-de-capture-image-modal-panel'],
    });
    this.dialogRef.afterOpened().subscribe(() => {
      this.cameraPhoto = new CameraPhoto(this.videoElem.nativeElement);
      this.cameraPhoto.startCamera(FACING_MODES.ENVIRONMENT)
        .then(() => {
          this.isCameraReady$.next(true);
        })
        .catch((error) => {
          this.errorTriggered.next(error.toString());
          this.forceHideDesktopTakePhoto = true;
          this.closeModal();
        });

        this.analyticsFormService.emitEventForm(
          ANALYTICS_FORM_NAME,
          {
            field: $localize `:@@payment-santander-de-pos.inquiry.filePicker.actions.takePhoto:`,
            action: AnalyticActionEnum.FOCUS,
          },
        );
    });
    this.dialogRef.beforeClosed().subscribe(() => {
      if (this.cameraPhoto?.stream) {
        this.cameraPhoto?.stopCamera().then(() => {
          this.isCameraReady$.next(false);
          this.cameraPhoto = null;
        });
      }

      this.analyticsFormService.emitEventForm(
        ANALYTICS_FORM_NAME,
        {
          field: $localize `:@@payment-santander-de-pos.inquiry.filePicker.actions.takePhoto:`,
          action: AnalyticActionEnum.BLUR,
        },
      );
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null;
      this.snapshotBase64 = null;
      this.isCameraReady$.next(false);
    });
  }

  closeModal(): void {
    this.dialogRef?.close();
    this.dialogRef = null;
  }

  triggerSnapshot(): void {
    this.snapshotBase64 = this.cameraPhoto.getDataUri({
      sizeFactor: 1,
      imageType: IMAGE_TYPES.JPG,
      imageCompression: 0.95,
      isImageMirror: false,
    });
  }

  pickImage(): void {
    this.filePicked.emit({ base64: this.snapshotBase64 });
    this.closeModal();
    this.analyticsFormService.emitEventForm(
      ANALYTICS_FORM_NAME,
      {
        field: $localize `:@@payment-santander-de-pos.inquiry.filePicker.actions.takePhoto:`,
        action: AnalyticActionEnum.CHANGE,
      },
    );
  }

  makeNewImage(): void {
    this.snapshotBase64 = null;
  }

  isMobile(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
      return true; // Windows Phone
    }
    if (/android/i.test(userAgent)) {
      return true; // Android
    }
    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return true; // iOS
    }

    return false;
  }

  isDesktop(): boolean {
    return !this.isMobile();
  }

  private processFile(file: File): void {
    // We don't have src image resolution so have to use very simple and not accurate solution
    const resizeK: number = (UPLOAD_FILE_SIZE_MB * 1024 * 1024) / file.size;

    if (resizeK < 1.0 && (Object.values(EImageType) as string[]).includes(file.type)) {
      this.isLoading$.next(true);
      compressAccurately(file, { size: 0.9 * UPLOAD_FILE_SIZE_MB * 1024, scale: resizeK }).then((blob) => {
        this.emitFileAsBase64(blob, file.name);
        this.isLoading$.next(false);
      }).catch((err) => {
        this.errorTriggered.next('Not possible to compress file!');
        this.isLoading$.next(false);
      });
    } else {
      this.emitFileAsBase64(file, file.name);
    }
  }

  private getBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader: FileReader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  }

  private emitFileAsBase64(file: File | Blob, name: string): void {
    this.getBase64(file).then((fileBase64: string) => {
      this.filePicked.emit({ base64: fileBase64.toString(), fileName: name });
    });
  }
}
