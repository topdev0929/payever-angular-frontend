import { CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { compressAccurately } from 'image-conversion';
import CameraPhoto, { IMAGE_TYPES } from 'jslib-html5-camera-photo';
import { Subject } from 'rxjs';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';


import { flowWithPaymentOptionsFixture } from '../../../test';
import { AdditionalStepsModule } from '../../additional-steps.module';

import { ImageCaptureComponent } from './image-capture.component';

jest.mock('jslib-html5-camera-photo');
jest.mock('image-conversion');

describe('ImageCaptureComponent', () => {

  let component: ImageCaptureComponent;
  let fixture: ComponentFixture<ImageCaptureComponent>;

  let store: Store;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(AdditionalStepsModule),
      ],
      declarations: [
        ImageCaptureComponent,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    fixture = TestBed.createComponent(ImageCaptureComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

  });

  afterEach(() => {

    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
    fixture?.destroy();

  });

  it('should create an instance', () => {

    expect(component).toBeTruthy();

  });

  it('should open file picker', () => {

    const fileInput: HTMLInputElement = fixture.debugElement.query(By.css('input[type="file"]'))?.nativeElement;
    expect(fileInput).toBeTruthy();
    const clickSpy = jest.spyOn(fileInput, 'click');
    component.openFilePicker();
    expect(clickSpy).toHaveBeenCalled();
    expect(fileInput.value).toEqual('');

  });

  it('should pick file', (done) => {

    const files = [new File([new Blob()], 'passport.png', { type: 'image/png' })];
    component.onPickFile({ target: { files } });
    component.filePicked.subscribe((file) => {
      expect(file).toBeTruthy();
      done();
    });

  });

  it('should initialize with default values', () => {

    expect(component.isFilePicked).toBeFalsy();
    expect(component.isLoading$.getValue()).toBeFalsy();
    expect(component.isCameraReady$.getValue()).toBeFalsy();

  });

  it('should emit filePicked event with correct data when a valid file is selected', (done) => {

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockEvt = { target: { files: [mockFile] } };
    const filePickedSpy = jest.spyOn(component.filePicked, 'emit');
    const processFileSpy = jest.spyOn((component as any), 'processFile');

    component.onPickFile(mockEvt);
    component.filePicked.subscribe((file) => {
      expect(file).toBeTruthy();
      expect(processFileSpy).toHaveBeenCalledWith(mockFile);
      expect(filePickedSpy)
        .toHaveBeenCalledWith(expect.objectContaining({ base64: expect.any(String), fileName: 'test.jpg' }));

      done();
    });

  });

  it('should compress large files', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    jest.spyOn(mockFile, 'size', 'get').mockReturnValue(2 * 1024 * 1024);

    const compress = (compressAccurately as jest.Mock).mockImplementation(() => 
      Promise.resolve(new Blob(['compressedData'], { type: 'image/jpeg' })));
    const mockEvt = { target: { files: [mockFile] } };
    component.onPickFile(mockEvt);
    expect(compress).toHaveBeenCalled();
  });

  it('should handle compress error', async () => {
    const errorTriggered = jest.spyOn(component.errorTriggered, 'next');
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    jest.spyOn(mockFile, 'size', 'get').mockReturnValue(2 * 1024 * 1024);

    const compress = (compressAccurately as jest.Mock).mockImplementation(() => 
      Promise.reject(new Error()));

    const mockEvt = { target: { files: [mockFile] } };
    component.onPickFile(mockEvt);
    expect(compress).toHaveBeenCalled();
    await new Promise(res => setTimeout(() => res(null), 100));
    expect(errorTriggered).toHaveBeenCalled();
  });

  it('should emit errorTriggered event if the selected file is too large', () => {

    const largeFile = new File([new ArrayBuffer(20 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const mockEvt = { target: { files: [largeFile] } };
    const errorTriggeredSpy = jest.spyOn(component.errorTriggered, 'next');
    const processFileSpy = jest.spyOn((component as any), 'processFile');

    component.onPickFile(mockEvt);

    expect(errorTriggeredSpy).toHaveBeenCalled();
    expect(processFileSpy).not.toHaveBeenCalled();

  });

  it('should open modal on taking a photo', () => {

    component.onTakePhotoDesktop();
    expect(component['dialogRef']).toBeDefined();

  });

  it('should close modal on closeModal', () => {

    component.closeModal();
    expect(component['dialogRef']).toBeNull();

  });

  it('should correctly identify android mobile device', () => {

    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue('android');

    expect(component.isMobile()).toBeTruthy();

  });

  it('should correctly identify if userAgent null', () => {

    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(null);
    jest.spyOn(navigator, 'vendor', 'get').mockReturnValue('android');

    expect(component.isMobile()).toBeTruthy();

  });

  it('should correctly identify if userAgent and vendor null', () => {

    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(null);
    jest.spyOn(navigator, 'vendor', 'get').mockReturnValue(null);
    (window as any).opera = 'iPhone';
    expect(component.isMobile()).toBeTruthy();

  });

  it('should correctly identify windows phone mobile device', () => {

    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue('windows phone');

    expect(component.isMobile()).toBeTruthy();

  });

  it('should correctly identify windows phone mobile device', () => {

    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue('iPad iPhone iPod');

    expect(component.isMobile()).toBeTruthy();

  });

  it('should correctly identify desktop device', () => {

    const FirefoxOnLinux = 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/118.0';

    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(FirefoxOnLinux);

    expect(component.isDesktop()).toBeTruthy();

  });

  it('should ngOnDestroy  close modal and clean up resources', () => {

    component.ngOnDestroy();
    expect(component['dialogRef']).toBeNull();

  });

  it('should reset snapshotBase64', () => {

    component.makeNewImage();
    expect(component.snapshotBase64).toBeNull();

  });

  it('should pickImage set image', () => {

    const filePicker = jest.spyOn(component.filePicked, 'emit');
    const closeModal = jest.spyOn(component, 'closeModal');

    component.pickImage();

    expect(filePicker).toHaveBeenCalled();
    expect(closeModal).toHaveBeenCalled();

  });

  describe('onTakePhotoDesktop', () => {
    let matDialogOpen: jest.SpyInstance;
    let isCameraReadyNext: jest.SpyInstance;
    let errorTriggeredNext: jest.SpyInstance;
    let closeModal: jest.SpyInstance;

    let startCamera: jest.Mock;
    let stopCamera: jest.Mock;

    let afterOpened: jest.Mock;
    let beforeClosed: jest.Mock;
    let afterClosed: jest.Mock;
    let afterOpenedSubject: Subject<any>;
    let beforeClosedSubject: Subject<any>;
    let afterClosedSubject: Subject<any>;

    beforeEach(() => {
      afterOpenedSubject = new Subject();
      beforeClosedSubject = new Subject();
      afterClosedSubject = new Subject();

      afterOpened = jest.fn().mockReturnValue(afterOpenedSubject);
      beforeClosed = jest.fn().mockReturnValue(beforeClosedSubject);
      afterClosed = jest.fn().mockReturnValue(afterClosedSubject);

      matDialogOpen = jest.spyOn(component['matDialog'], 'open')
        .mockReturnValue({
          afterOpened,
          beforeClosed,
          afterClosed,
          close: jest.fn(),
        } as any);

      startCamera = jest.fn();
      stopCamera = jest.fn();

      (CameraPhoto as jest.Mock).mockImplementation(() => ({
        startCamera,
        stopCamera,
        stream: 'Media Stream',
      }));

      isCameraReadyNext = jest.spyOn(component.isCameraReady$, 'next');
      errorTriggeredNext = jest.spyOn(component.errorTriggered, 'next');
      closeModal = jest.spyOn(component, 'closeModal');

      component.videoElem = { nativeElement: 'mock' };
    });

    it('should get dialogRef and subscribe', () => {
      component.onTakePhotoDesktop();

      expect(matDialogOpen).toHaveBeenCalledWith(component.modalContent, {
        autoFocus: false,
        disableClose: false,
        panelClass: ['dialog-overlay-panel', 'pe-checkout-bootstrap', 'pe-checkout-pos-de-capture-image-modal-panel'],
      });
      expect(afterOpened).toHaveBeenCalled();
      expect(beforeClosed).toHaveBeenCalled();
      expect(afterClosed).toHaveBeenCalled();
    });

    it('should afterOpened work correctly', fakeAsync(() => {
      startCamera.mockResolvedValue(null);

      component.onTakePhotoDesktop();
      afterOpenedSubject.next();
      tick();

      expect(isCameraReadyNext).toHaveBeenCalledWith(true);
    }));

    it('should afterOpened handle error', fakeAsync(() => {
      const error = 'error';
      startCamera.mockRejectedValue(error);

      component.onTakePhotoDesktop();
      afterOpenedSubject.next();
      tick();

      expect(errorTriggeredNext).toHaveBeenCalledWith(error.toString());
      expect(component.forceHideDesktopTakePhoto).toBeTruthy();
      expect(closeModal).toHaveBeenCalled();
    }));

    it('should beforeClosed work correctly', fakeAsync(() => {
      startCamera.mockResolvedValue(null);
      stopCamera.mockResolvedValue(null);

      component.onTakePhotoDesktop();
      afterOpenedSubject.next();
      tick();
      beforeClosedSubject.next();
      tick();

      expect(stopCamera).toHaveBeenCalled();
      expect(isCameraReadyNext).toHaveBeenCalledWith(false);
      expect(component.cameraPhoto).toBeNull();
    }));

    it('should afterClosed work correctly', fakeAsync(() => {
      component.onTakePhotoDesktop();
      afterClosedSubject.next();
      tick();
      expect(component['dialogRef']).toBeNull();
      expect(component.snapshotBase64).toBeNull();
      expect(isCameraReadyNext).toHaveBeenCalledWith(false);
    }));
  });

  describe('triggerSnapshot', () => {
    it('should triggerSnapshot work correctly', () => {
      const expectedSnapshotBase64 = 'snapshotBase64';
      const getDataUri = jest.fn().mockReturnValue(expectedSnapshotBase64);
      component.cameraPhoto = {
        getDataUri,
      } as any;
      component.triggerSnapshot();
      expect(getDataUri).toHaveBeenCalledWith({
        sizeFactor: 1,
        imageType: IMAGE_TYPES.JPG,
        imageCompression: 0.95,
        isImageMirror: false,
      });
      expect(component.snapshotBase64).toEqual(expectedSnapshotBase64);
    });
  });

});
