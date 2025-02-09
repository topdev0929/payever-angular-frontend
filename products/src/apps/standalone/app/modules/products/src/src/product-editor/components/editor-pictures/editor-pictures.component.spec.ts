import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { TranslatePipe, TranslateService } from '@pe/i18n';
import { MediaService, MediaUrlPipe } from '@pe/media';

import { EnvironmentConfigService } from '../../../environment-config';
import { SnackBarService } from '../../../snackbar';
import { ImageDetailsInterface, ImagesUploaderService, UploadEvent, UploadEventTypeEnum, UploadProgressEvent, UploadResultEvent } from '../../../../shared/services';
import { AssetsDragAndDropComponent } from '../../assets/assets-drag-and-drop/assets-drag-and-drop.component';
import { LoadImageDirective } from '../../core/load-image.directive';
import { EditorPicturesComponent } from './editor-pictures.component';

import { DragulaService } from 'ng2-dragula';

describe('EditorPicturesComponent', () => {
  const BUSINESS_ID = 'business_id';
  const MEDIA_IMG_URL = 'media_img_url';

  let component: EditorPicturesComponent;
  let fixture: ComponentFixture<EditorPicturesComponent>;

  let mediaServiceSpy: jasmine.SpyObj<MediaService>;
  let snackBarServiceSpy: jasmine.SpyObj<SnackBarService>;
  let dragulaServiceSpy: jasmine.SpyObj<DragulaService>;
  let imagesUploaderServiceSpy: jasmine.SpyObj<ImagesUploaderService>;

  let activatedRoute: any;

  beforeEach(() => {
    mediaServiceSpy = jasmine.createSpyObj<MediaService>('MediaService', [
      'createBlobByBusiness',
      'getMediaUrl',
    ]);
    mediaServiceSpy.createBlobByBusiness.and.returnValue(new Subject());
    mediaServiceSpy.getMediaUrl.and.returnValue(MEDIA_IMG_URL);

    snackBarServiceSpy = jasmine.createSpyObj<SnackBarService>('SnackBarService', ['show']);

    dragulaServiceSpy = jasmine.createSpyObj<DragulaService>('DragulaService', [
      'createGroup',
      'remove',
      'destroy',
    ]);
    dragulaServiceSpy.remove.and.returnValue(new Subject());

    imagesUploaderServiceSpy = jasmine.createSpyObj<ImagesUploaderService>('DragulaService', [
      'uploadImages',
    ]);
    imagesUploaderServiceSpy.uploadImages.and.returnValue(new Subject());

    activatedRoute = {
      snapshot: {
        params: {
          slug: BUSINESS_ID,
        },
      },
    };

    TestBed.configureTestingModule({
      imports: [
        MatProgressSpinnerModule,
        WindowModule,
      ],
      providers: [
        EnvironmentConfigService,

        ChangeDetectorRef,
        TranslateService,

        { provide: ImagesUploaderService, useValue: imagesUploaderServiceSpy },
        { provide: DragulaService, useValue: dragulaServiceSpy },
        { provide: MediaService, useValue: mediaServiceSpy },
        { provide: SnackBarService, useValue: snackBarServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
      declarations: [
        TranslatePipe,
        MediaUrlPipe,

        LoadImageDirective,

        AssetsDragAndDropComponent,
        EditorPicturesComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorPicturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('dragulaService should be inited', () => {
    expect(dragulaServiceSpy.createGroup).toHaveBeenCalled();
    expect(dragulaServiceSpy.remove).toHaveBeenCalled();
  });

  it('dragulaService should be destroyed', () => {
    component.ngOnDestroy();

    expect(dragulaServiceSpy.destroy).toHaveBeenCalled();
  });

  it('previewImageUrl should call uploaded image url', () => {
    const url = component.previewImageUrl;

    expect(url).toEqual(MEDIA_IMG_URL);
    expect(mediaServiceSpy.getMediaUrl).toHaveBeenCalled();
  });

  it('changePreview should change preview image', () => {
    const previewImage = 'img1';
    component.changePreview(previewImage);

    expect(component.previewImage).toBe(previewImage);
  });

  it('onStartSortImg should set isDraggingSort to true', () => {
    component.onStartSortImg();

    expect(component.isDraggingSort).toBe(true);
  });

  it('onFileOver should toggle dragging state', () => {
    component.onFileOver(true);

    expect(component.isDragging).toBe(true);

    component.onFileOver(false);

    expect(component.isDragging).toBe(false);
  });

  it('onDropSortImg should move image in array', (done) => {
    const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
    const currentIndex = 0;
    const previousIndex = 2;

    component.blobs = [...images];
    component.changePictures.subscribe((pictures: string[]) => {
      expect(pictures[currentIndex]).toEqual(images[previousIndex]);

      done();
    });

    component.onDropSortImg({
      previousIndex,
      currentIndex,
    } as CdkDragDrop<string[]>);
  });

  it('onDropSortImg should set new preview image', () => {
    const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
    const currentIndex = 0;
    const previousIndex = 2;

    component.blobs = [...images];

    component.onDropSortImg({
      previousIndex,
      currentIndex,
    } as CdkDragDrop<string[]>);

    expect(component.previewImage).toEqual(images[previousIndex]);
  });

  it('onFileDrop should upload files', () => {
    const images = [{
      name: 'image1.jpg',
      size: 101,
      type: 'image/jpeg',
    },
    {
      name: 'image2.jpg',
      size: 102,
      type: 'image/jpeg',
    },
    {
      name: 'image3.jpg',
      size: 103,
      type: 'image/jpeg',
    }] as unknown;

    component.onFileDrop(images as FileList);

    expect(imagesUploaderServiceSpy.uploadImages).toHaveBeenCalledWith(images as File[]);
  });

  it('onFileDrop should filter files with size more than 5mb', () => {
    const images = [{
      name: 'image1.jpg',
      size: 5555555,
      type: 'image/jpeg',
    },
    {
      name: 'image2.jpg',
      size: 101,
      type: 'image/jpeg',
    }] as unknown as FileList;

    component.onFileDrop(images);

    expect(imagesUploaderServiceSpy.uploadImages).toHaveBeenCalledWith([images[1]]);
    expect(snackBarServiceSpy.show).toHaveBeenCalled();
  });

  it('onFileDrop should filter files which type is not image', () => {
    const images = [{
      name: 'image1.jpg',
      size: 101,
      type: 'image/jpeg',
    },
    {
      name: 'image2.jpg',
      size: 102,
      type: 'text/html',
    }] as unknown as FileList;

    component.onFileDrop(images);

    expect(imagesUploaderServiceSpy.uploadImages).toHaveBeenCalledWith([images[0]]);
    expect(snackBarServiceSpy.show).toHaveBeenCalled();
  });

  it('onFileDrop should upload only 15 images', () => {
    const maxImagesCount = 15;
    const maxImagesCountOverflow = maxImagesCount + 1;
    const image = {
      name: 'image1.jpg',
      size: 101,
      type: 'image/jpeg',
    };
    const images = new Array(maxImagesCountOverflow).fill(image);

    component.onFileDrop(images as unknown as FileList);

    expect(imagesUploaderServiceSpy.uploadImages).toHaveBeenCalled();
    expect(imagesUploaderServiceSpy.uploadImages.calls.argsFor(0)[0].length).toEqual(maxImagesCount);
    expect(snackBarServiceSpy.show).toHaveBeenCalled();
  });

  it('onFileDrop save pictures urls and fire chenge event', (done) => {
    imagesUploaderServiceSpy.uploadImages.and.callFake((files) => {
      return new Observable<UploadEvent<UploadProgressEvent | UploadResultEvent>>((observer) => {
        const imageDetails: ImageDetailsInterface[]  = files.map((file) => ({
          originalName: file.name,
          url: file.name,
        }));

        observer.next({
          data: {
            uploadedImages: imageDetails,
            lastUploadedImage: imageDetails[0],
          },
          type: UploadEventTypeEnum.RESULT,
        });

        observer.complete();
      });
    });

    const images = [{
      name: 'image1.jpg',
      size: 101,
      type: 'image/jpeg',
    }] as unknown;

    component.changePictures.subscribe((pictures: string[]) => {
      expect(pictures[0]).toEqual((images as File[])[0].name);
      expect(component.pictures).toEqual(pictures);

      done();
    });

    component.onFileDrop(images as FileList);
  });

  it('onFileChange should upload files and reset native input value', () => {
    const images = [{
      name: 'image1.jpg',
      size: 101,
      type: 'image/jpeg',
    },
    {
      name: 'image2.jpg',
      size: 102,
      type: 'image/jpeg',
    },
    {
      name: 'image3.jpg',
      size: 103,
      type: 'image/jpeg',
    }] as unknown;
    component.imageFileInput = {
      nativeElement: {
        value: true,
      },
    };

    component.onFileChange({ target: { files: images as FileList } } as unknown as Event);

    expect(imagesUploaderServiceSpy.uploadImages).toHaveBeenCalledWith(images as File[]);
    expect(component.imageFileInput.nativeElement.value).toBe(null);
  });

  it('#moveNextImage should scroll images', () => {
    const index_1 = 1;
    const index_2 = 2;
    const arrayLength = 6;

    component.pictures = new Array(arrayLength).fill('img');

    component.moveNextImage();

    expect(component.imagesStartIndex).toBe(index_1);
    expect(component.isDisabledScrollRight).toBe(false);

    component.moveNextImage();

    expect(component.imagesStartIndex).toBe(index_2);
    expect(component.isDisabledScrollRight).toBe(true);
  });

  it('#movePrevImage should scroll images', () => {
    const index_1 = 1;
    const index_2 = 2;

    component.imagesStartIndex = index_2;

    component.movePrevImage();

    expect(component.imagesStartIndex).toBe(index_1);
    expect(component.isDisabledScrollLeft).toBe(false);

    component.movePrevImage();

    expect(component.imagesStartIndex).toBe(0);
    expect(component.isDisabledScrollLeft).toBe(true);
  });

  it('deleteImage should delete image', (done) => {
    const imageUrl = 'image1_url';
    component.pictures = [imageUrl];

    expect(component.pictures).toEqual([imageUrl]);

    component.changePictures.subscribe((pictures: string[]) => {
      expect(pictures).toEqual([]);
      expect(component.pictures).toEqual([]);

      done();
    });

    component.deleteImage(imageUrl);
  });
});
