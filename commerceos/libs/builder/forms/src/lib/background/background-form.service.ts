import { Inject, Injectable, Injector, Optional } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, Observable, ReplaySubject, Subject, Subscription, forkJoin, merge, of } from 'rxjs';
import {
  catchError,
  filter,
  map,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { parsePebColor } from '@pe/builder/color-utils';
import {
  MediaType,
  PebElementStyles,
  PebElementType,
  PebFillMode,
  PebFillType,
  PebGradientType,
  PebImageFill,
  PebMediaService,
  PebScreen,
  PebSize,
  PebUnit,
  isGradient,
  isImage,
  isSolid,
  isVideo,
  isStudioOrigin,
  pebGenerateId,
  isJs,
  isThreeJs,
  isIframe,
} from '@pe/builder/core';
import {
  bboxDimension,
  calculatePebSizeToPixel,
  convertedSize,
} from '@pe/builder/editor-utils';
import { getBackgroundCssStyles, getPreviewBackgroundStyle, PebElement } from '@pe/builder/render-utils';
import { PebViewPatchAction } from '@pe/builder/renderer';
import { PebElementsState, PebOptionsState, PebSyncAction, PebUpdateAction } from '@pe/builder/state';
import { APP_TYPE, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PebShopContainer } from '@pe/resources/shared';
import { SnackbarService } from '@pe/snackbar';

import {
  colorStopForm,
  defaultGradientFill,
  defaultImageFill,
  defaultMediaFill,
  defaultJsFill,
  defaultThreeJsFill,
  imageForm,
  jsForm,
  mainForm,
  threeJsForm,
  videoForm,
  defaultIframeFill,
  iframeForm,
} from './const';

export const toBase64 = (file: File) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});


@Injectable()
export class PebBackgroundFormService {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;
  @Select(PebOptionsState.screen) screen$: Observable<PebScreen>;

  activeMediaType$ = new ReplaySubject<MediaType>(1);
  bgImageLoading$ = new BehaviorSubject<boolean>(false);
  destroy$ = new Subject<void>();
  dirty$ = new ReplaySubject<{ [key: string]: boolean }>(1);
  preview$ = new ReplaySubject<any>(1);
  imageFillPreview$ = new ReplaySubject<any>(1);
  prevPayload$ = new BehaviorSubject<any>(null);
  submit$ = new BehaviorSubject<boolean>(false);
  thumbnail$ = new ReplaySubject<string>(1);
  unsavedUpdates: { styles?: Partial<PebElementStyles>, mediaType?: MediaType };
  backgroundForm = this.fb.group({
    ...mainForm,
    [PebFillType.Gradient]: this.fb.group({
      angle: [90],
      colorStops: this.fb.array([]),
    }),
    [PebFillType.Image]: this.fb.group(imageForm),
    [PebFillType.Video]: this.fb.group(videoForm),
    [PebFillType.Js]: this.fb.group(jsForm),
    [PebFillType.Iframe]: this.fb.group(iframeForm),
    [PebFillType.ThreeJs]: this.fb.group(threeJsForm),
  });

  imageFillModes$ = this.selectedElements$.pipe(
    filter(elements => elements?.length > 0),
    map(([element]) => {
      const fillModes = [{
        value: PebFillMode.Original,
        name: this.translateService.translate('builder-app.forms.background.original_size'),
        icon: 'fill-original',
      }];

      if (element.type !== PebElementType.Vector) {
        fillModes.push(
          {
            value: PebFillMode.Stretch,
            name: this.translateService.translate('builder-app.forms.background.stretch'),
            icon: 'fill-stretch',
          },
          {
            value: PebFillMode.Tile,
            name: this.translateService.translate('builder-app.forms.background.tile'),
            icon: 'fill-tile',
          },
          {
            value: PebFillMode.Fill,
            name: this.translateService.translate('builder-app.forms.background.scale_fill'),
            icon: 'fill-fill',
          },
          {
            value: PebFillMode.Fit,
            name: this.translateService.translate('builder-app.forms.background.scale_fit'),
            icon: 'fill-fit',
          },
        );
      }

      return fillModes;
    })
  );


  units$ = this.selectedElements$.pipe(
    filter(elements => elements?.length > 0),
    map(([element]) => {
      const units = [PebUnit.Auto, PebUnit.Percent];
      if (element.type !== PebElementType.Vector) {
        units.push(PebUnit.Pixel);
      }

      return units;
    })
  );

  private selectedElementsSubscription?: Subscription;

  constructor(
    private readonly injector: Injector,
    private readonly mediaService: PebMediaService,
    private readonly store: Store,
    private readonly snackbarService: SnackbarService,
    private fb: FormBuilder,
    private readonly translateService: TranslateService,
    @Optional() @Inject(APP_TYPE) private entityName,
  ) {
  }

  init() {
    this.selectedElementsSubscription?.unsubscribe();

    this.selectedElementsSubscription = this.selectedElements$.pipe(
      filter(elements => elements?.length > 0),
      map((elements) => {
        this.generatePreview(elements);
        this.generateThumbnail(elements);
        this.initForm(elements);

        return elements;
      }),
      switchMap(elements =>
        merge(
          this.submit$.pipe(
            filter(submit => submit),
            tap(() => this.submitChanges(elements)),
          ),
          this.backgroundForm.valueChanges.pipe(
            filter(() => this.backgroundForm.dirty),
            tap((value) => {
              this.handleDirtyFields(elements);
              this.handleScaleDisable();
            }),
          )
        )
      ),
      takeUntil(this.destroy$),
      catchError((e) => {
        console.error(e);

        return e;
      })
    ).subscribe();
  }

  initForm(elements: PebElement[]) {
    const [element] = elements;
    this.unsavedUpdates = {};
    this.backgroundForm.reset();
    this.colorStopsForm.clear();

    const fill = element.styles?.fill;
    const solidFill = isSolid(fill) ? fill : null;
    let imageFill = isImage(fill) ? fill : null;
    const gradientFill = isGradient(fill) ? fill : defaultGradientFill;
    const videoFill = isVideo(fill) ? fill : null;
    const jsFill = isJs(fill) ? fill : null;
    const threeJsFill = isThreeJs(fill) ? fill : null;
    const iframeFill = isIframe(fill) ? fill : null;
    gradientFill.colorStops.forEach(() => this.colorStopsForm.push(this.fb.group(colorStopForm), { emitEvent: false }));

    if (imageFill) {
      this.generateImageFillPreview(imageFill);

      imageFill = {
        ...imageFill,
        positionX: imageFill.positionX ?? 'center',
        positionY: imageFill.positionY ?? 'center',
      };
    }

    let mediaType: MediaType = MediaType.None;
    if (isStudioOrigin(fill)) {
      mediaType = MediaType.Studio
    } else if (isVideo(fill)) {
      mediaType = MediaType.Video;
    } else if (isImage(fill)) {
      mediaType = MediaType.Image;
    }

    const initialValue = {
      type: fill?.type || '',
      color: solidFill?.color,
      [PebFillType.Gradient]: gradientFill,
      [PebFillType.Image]: {
        ...defaultImageFill,
        ...imageFill,
      },
      [PebFillType.Video]: {
        ...defaultMediaFill,
        ...videoFill,
      },
      [PebFillType.Js]: {
        ...defaultJsFill,
        ...jsFill,
      },
      [PebFillType.ThreeJs]: {
        ...defaultThreeJsFill,
        ...threeJsFill,
      },
      [PebFillType.Iframe]: {
        ...defaultIframeFill,
        ...iframeFill,
      },
      mediaType,
      file: null,
    };

    this.backgroundForm.markAsPristine();
    this.backgroundForm.patchValue(initialValue, { emitEvent: false });
    this.handleScaleDisable();
    this.bgImageLoading$.next(false);
    this.submit$.next(false);
  }

  private handleDirtyFields(elements: PebElement[]) {
    const value = this.backgroundForm.value;
    const styles: Partial<PebElementStyles> = {};

    const dirty: { [key: string]: boolean } =
      Object.keys(value).reduce((acc, key) => ({ ...acc, [key]: this.backgroundForm.get(key).dirty }), {});

    if (dirty.mediaType) {
      switch (value.mediaType) {
        case MediaType.None:
          dirty.color = true;
          break;

        case MediaType.Image:
          dirty.image = true;
          break;

        case MediaType.Video:
          dirty.video = true;
          break;
      }

      this.activeMediaType$.next(value.mediaType);
    }

    if (dirty.color) {
      styles.fill = {
        type: PebFillType.Solid,
        color: value.color,
      };
      styles.mediaType = MediaType.None;
    }

    if (dirty[PebFillType.Gradient]) {
      styles.fill = {
        type: PebFillType.Gradient,
        gradientType: PebGradientType.Linear,
        angle: value.gradient.angle,
        colorStops: value.gradient.colorStops,
      };
      styles.mediaType = MediaType.None;
    }

    if (dirty[PebFillType.Image]) {
      const image = this.backgroundForm.getRawValue()[PebFillType.Image];
      const scale = this.getScale(image.scale);
      this.backgroundForm.get('image').get('scale').patchValue(scale, { emitEvent: false });

      styles.fill = {
        ...image,
        scale,
        type: PebFillType.Image,
        fillColor: image.fillColor,
      };
      this.generateImageFillPreview(styles.fill as PebImageFill);
      styles.mediaType = MediaType.Image;
      dirty.mediaType = true;
    }

    if (dirty[PebFillType.Video]) {
      const video = this.backgroundForm.getRawValue()[PebFillType.Video];
      const scale = this.getScale(video.scale);

      styles.fill = {
        ...video,
        scale,
        type: PebFillType.Video,
        fillColor: parsePebColor(video.fillColor),
      };
      styles.mediaType = MediaType.Video;
    }

    if (dirty[PebFillType.Js]) {
      const js = this.backgroundForm.getRawValue()[PebFillType.Js];

      styles.fill = {
        ...js,
      };
    }

    if (dirty[PebFillType.Iframe]) {
      const iframe = this.backgroundForm.getRawValue()[PebFillType.Iframe];

      styles.fill = {
        ...iframe,
      };
    }

    if (dirty[PebFillType.ThreeJs]) {
      const threeJs = this.backgroundForm.getRawValue()[PebFillType.ThreeJs];

      styles.fill = {
        ...threeJs,
      };
    }

    if (dirty.file) {
      this.backgroundForm.value.mediaType === MediaType.Image
        ? this.uploadImage(value.file, elements)
        : this.uploadVideo(value.file, elements);
    }

    this.patchElements(elements, { ...this.unsavedUpdates?.styles, ...styles });
    this.backgroundForm.markAsPristine();
    Object.keys(styles).length > 0 && (this.unsavedUpdates = { ...this.unsavedUpdates, ...{ styles } });


    dirty.mediaType && this.submit$.next(true);
  }

  private getScale(scale: PebSize): PebSize {
    const [element] = this.store.selectSnapshot(PebElementsState.selected);

    if (isImage(element.styles.fill)) {
      const parentDim = bboxDimension(element);
      const [calculated] = calculatePebSizeToPixel([element.styles.fill.scale], parentDim.width);

      const newScale = convertedSize(
        element.styles.fill.scale,
        scale,
        parentDim.width,
        calculated,
      );

      return newScale;
    }

    return scale;
  }

  generateImageFillPreview(fill: PebImageFill) {
    this.imageFillPreview$.next(getPreviewBackgroundStyle({ type: PebFillType.Solid, color: fill.fillColor }));
  }

  private generatePreview([element]: PebElement[]) {
    this.preview$.next(getPreviewBackgroundStyle(element?.styles?.fill));
  }

  private generateThumbnail([element]: PebElement[]) {
    const fill = element?.styles?.fill;
    let url: string = null;

    if (isImage(fill)) {
      url = fill.url
    }
    if (isVideo(fill)) {
      url = fill.preview
    }

    this.thumbnail$.next(url);
  }

  private patchElements(elements, styles) {
    if (styles && Object.keys(styles).length > 0) {
      this.store.dispatch(new PebViewPatchAction(
        elements.map((elm) => {
          const updateStyle = getBackgroundCssStyles(styles.fill);
          const style = {
            backgroundImage: null,
            backgroundColor: null,
            backgroundSize: null,
            backgroundRepeat: null,
            backgroundPosition: null,
            ...updateStyle,
          };

          return { id: elm.id, style } as any;
        }
        )),
      );
    }
  }

  private submitChanges(elements) {
    if (Object.keys(this.unsavedUpdates).length === 0) {
      return;
    }
    const fill = this.unsavedUpdates.styles.fill;
    const payload = elements.map(elm => ({ id: elm.id, ...this.unsavedUpdates }));

    this.store.dispatch(new PebUpdateAction(payload)).pipe(
      tap(() => fill && this.store.dispatch(new PebSyncAction(elements, { fill: true }))),
      take(1),
    ).subscribe();
    this.unsavedUpdates = {};
  }

  private handleScaleDisable() {
    const imageScale = this.backgroundForm.controls.image.get('scale');
    const videoScale = this.backgroundForm.controls.video.get('scale');

    const enabledModes = [PebFillMode.Original, PebFillMode.Tile];

    enabledModes.includes(this.backgroundForm.value?.image?.fillMode)
      ? imageScale.enable({ emitEvent: false })
      : imageScale.disable({ emitEvent: false });

    enabledModes.includes(this.backgroundForm.value?.video?.fillMode)
      ? videoScale.enable({ emitEvent: false })
      : videoScale.disable({ emitEvent: false });
  }

  private uploadImage(file, elements) {
    const updateImageScale = () => {
      const scale = { value: 100, unit: PebUnit.Auto };

      return scale;
    };

    this.bgImageLoading$.next(true);
    const blobName = pebGenerateId();
    const env = this.injector.get(PE_ENV);
    const container = `${this.entityName}-images`;
    const url = `${env?.custom?.cdn}/${container}/${blobName}`;
    const messageChannel$ = new Observable((obs) => {
      const messageChannel = new MessageChannel();
      toBase64(file).then((data) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.error) {
            obs.error(event.data.error);
          } else {
            obs.next(event.data);
          }
          obs.complete();
        };
        /** Store blob in service worker cache until we got uploaded image */
        navigator.serviceWorker?.controller?.postMessage(
          { url, data, action: 'UPLOAD' },
          [messageChannel.port2]);
      });
    });

    const imgDimensions$ = new Observable<{ width: number, height: number }>((obs) => {
      const img = new Image();
      img.onload = () => {
        obs.next({ width: img.width, height: img.height });
        obs.complete();
      };
      img.src = URL.createObjectURL(file);
    });

    forkJoin([
      messageChannel$.pipe(
        takeUntil(this.destroy$),
        catchError(() => of(true)),
      ),
      imgDimensions$.pipe(
        switchMap(dimensions => this.mediaService.uploadImage(file, `cdn/${container}`, blobName).pipe(
          withLatestFrom(this.screen$),
          tap(() => {
            const scale = updateImageScale();

            this.backgroundForm.controls.image.markAsDirty();
            this.backgroundForm.controls.image.patchValue({
              origin: null,
              url,
              mimeType: file.type,
              fillMode: PebFillMode.Original,
              scale,
              width: dimensions.width,
              height: dimensions.height,
            });
            this.submit$.next(true);

            this.bgImageLoading$.next(false);
            this.snackbarService.toggle(true, {
              content: 'Image is uploaded successfully',
              duration: 2000,
              iconId: 'icon-commerceos-success',
            });
          }),
          takeUntil(this.destroy$),
          catchError((err) => {
            console.error(err);
            this.bgImageLoading$.next(false);

            this.snackbarService.toggle(true, {
              content: err.error?.message ?? 'Cannot load image',
              duration: 2000,
              iconId: 'icon-commerceos-error',
            });

            return of(true);
          }),
        )),
      ),
    ]).toPromise();
  }

  private uploadVideo(file, elements) {
    this.bgImageLoading$.next(true);
    this.mediaService.uploadVideo(file, PebShopContainer.BuilderVideo).pipe(
      tap((result) => {
        this.backgroundForm.controls.video.markAsDirty();
        this.backgroundForm.controls.video.patchValue({
          origin: null,
          url: result.blobName,
          mimeType: 'video',
          preview: result.preview,
        });
        this.submit$.next(true);

        this.bgImageLoading$.next(false);
        this.snackbarService.toggle(true, {
          content: 'Video is uploaded successfully',
          duration: 2000,
          iconId: 'icon-commerceos-success',
        });
      }),
      takeUntil(this.destroy$),
      catchError((err) => {
        console.error(err);
        this.bgImageLoading$.next(false);

        this.snackbarService.toggle(true, {
          content: err?.error?.message ?? 'Upload is not possible due to server error',
          duration: 2000,
          iconId: 'icon-commerceos-error',
        });

        return of(true);
      }),
    ).toPromise();
  }

  get gradientForm(): FormGroup {
    return this.backgroundForm.controls.gradient as FormGroup;
  }

  get colorStopsForm(): FormArray {
    return this.gradientForm.controls.colorStops as FormArray;
  }
}
