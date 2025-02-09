import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { forkJoin } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebElement, PebPageStore } from '@pe/builder-core';
import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { CarouselElementComponent } from '@pe/builder-editor/projects/modules/elements/src/basic/carousel-component/carousel.component';
import { ElementsRegistry } from '@pe/builder-editor/projects/modules/shared/services/elements.registry';
import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { ErrorBag, ImageUploadService } from '@pe/ng-kit/modules/form';
import { MediaContainerType } from '@pe/ng-kit/modules/media';
import { SnackbarComponent } from '../../../components/snackbar/snackbar.component';
import { BlobUploadService } from '../../../services/blob-upload.service';
import { SnackbarService } from '../../../services/snackbar.service';

@Component({
  selector: 'pe-builder-carousel-settings',
  templateUrl: 'carousel-settings.component.html',
  styleUrls: ['carousel-settings.component.scss'],
  providers: [ErrorBag],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselWidgetSettingsComponent extends AbstractComponent implements AfterViewInit, OnChanges {
  @Input() editor: EditorState;
  @Input() registry: ElementsRegistry;
  @Input() pageStore: PebPageStore;
  @Input() activePebElement: PebElement;

  private businessId: string;
  private component: CarouselElementComponent;
  private currentSlideIndex = 0;

  constructor(
    private blobUploadService: BlobUploadService,
    private imageUploadService: ImageUploadService,
    private snackbarService: SnackbarService,
    private activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
  ) {
    super();
  }

  ngAfterViewInit(): void {
    this.activatedRoute.parent.params
      .pipe(
        tap((params: Params) => (this.businessId = params.businessId)),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.activePebElement) {
      this.component = this.registry.getComponent(changes.activePebElement.currentValue.id) as CarouselElementComponent;
    }
  }

  get images(): string[] {
    return this.activePebElement.data.sources;
  }

  getImageTitle(image: string): string {
    const arr = image.split('/');

    return arr[arr.length - 1];
  }

  getPreviewImage(image: string): SafeStyle {
    return this.domSanitizer.bypassSecurityTrustStyle(`url(${image})`);
  }

  add(): void {
    this.blobUploadService
      .selectImages()
      .pipe(
        filter((files: File[]) => {
          const isSizeValid = files.every(file => this.imageUploadService.checkImage(file, false));
          if (isSizeValid) {
            return true;
          }
          this.snackbarService.open(SnackbarComponent, 'Maximum size exceeded');

          return false;
        }),
        tap(() => {
          this.pageStore.updateElement(this.editor.activeElement, {
            meta: {
              loading: true,
            },
          });
        }),
        switchMap(files => forkJoin(files.map(file => this.blobUploadService.createBlob(this.businessId, file)))),
        tap((result: string[]) => {
          this.pageStore.updateElement(this.editor.activeElement, {
            meta: {
              loading: false,
            },
            data: {
              sources: [...this.activePebElement.data.sources, ...result],
            },
          });
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  replace(): void {
    this.blobUploadService
      .selectImages()
      .pipe(
        filter((files: File[]) => {
          const isSizeValid = files.every((file: File) => this.imageUploadService.checkImage(file, false));
          if (isSizeValid) {
            return true;
          }
          this.snackbarService.open(SnackbarComponent, 'Maximum size exceeded');

          return false;
        }),
        tap(() => {
          this.pageStore.updateElement(this.editor.activeElement, {
            meta: {
              loading: true,
            },
          });
        }),
        switchMap(files => forkJoin(files.map(file => this.blobUploadService.createBlob(this.businessId, file)))),
        tap((result: string[]) => {
          this.pageStore.updateElement(this.editor.activeElement, {
            meta: {
              loading: false,
            },
            data: {
              sources: [
                ...this.activePebElement.data.sources.slice(0, this.currentSlideIndex),
                ...result,
                ...this.activePebElement.data.sources.slice(this.currentSlideIndex + 1),
              ],
            },
          });
          this.component.baseCarousel.currentSlide = this.currentSlideIndex;
          this.component.baseCarousel.transitionCarousel(0);
        }),
        switchMap(() => {
          const image = this.activePebElement.data.sources.find((imageName, i: number) => i === this.currentSlideIndex);
          const blobName = image.split('/').splice(-1)[0];

          return this.blobUploadService.deleteBlob(blobName, this.businessId, MediaContainerType.Builder);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  select(index: number): void {
    this.component.baseCarousel.currentSlide = this.currentSlideIndex = index;
    this.component.baseCarousel.transitionCarousel(0);
  }

  remove(index: number): void {
    const sources = this.activePebElement.data.sources.filter((image, i: number) => i !== index);
    const isLastSelected = this.activePebElement.data.sources.length - 1 === this.currentSlideIndex;

    const image = this.activePebElement.data.sources.find((imageUrl, i: number) => i === index);
    const blobName = image.split('/').splice(-1)[0];

    this.pageStore.updateElement(this.editor.activeElement, {
      data: {
        sources,
      },
    });

    this.component.baseCarousel.currentSlide = index < this.currentSlideIndex || isLastSelected
      ? this.currentSlideIndex = this.currentSlideIndex - 1
      : this.currentSlideIndex;

    this.component.baseCarousel.transitionCarousel(0);

    this.blobUploadService.deleteBlob(blobName, this.businessId, MediaContainerType.Builder).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
