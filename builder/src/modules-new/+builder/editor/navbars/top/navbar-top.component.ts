import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { forkJoin, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebElement, PebElementType, PebPageStore, PebPageType, PebThemeStore } from '@pe/builder-core';
import {
  EditorAppendElementInterface,
  EditorState,
} from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { ButtonElementTypes, ShapesElementTypes } from '@pe/builder-editor/projects/modules/elements/src';
import { ELEMENTS_REGISTRY } from '@pe/builder-editor/projects/modules/elements/src/constants';
import { EditorEventInterface } from '@pe/builder-editor/projects/modules/shared/interfaces';
import { ElementsRegistry } from '@pe/builder-editor/projects/modules/shared/services/elements.registry';
import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { ImageUploadService } from '@pe/ng-kit/modules/form';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { ThemeData } from '../../../../core/theme.data';
import { BuilderMediaSidebarApi } from '../../../api/media-sidebar.api';
import { SnackbarComponent } from '../../../components/snackbar/snackbar.component';
import {
  NavbarCategoryData,
  NavbarMenuItemInterface,
  NavbarMenuItemMediaEnum,
  NavbarPageInterface,
  NavbarSelectInterface,
} from '../../../entities/navbar';
import { BlobUploadService } from '../../../services/blob-upload.service';
import { ElementsFactory } from '../../../services/elements.factory';
import { ProductsService } from '../../../services/products.service';
import { SnackbarService } from '../../../services/snackbar.service';

@Component({
  selector: 'pe-builder-navbar-top',
  templateUrl: './navbar-top.component.html',
  styleUrls: ['./navbar-top.component.scss'],
  providers: [ElementsFactory, BuilderMediaSidebarApi],
})
export class NavbarTopComponent extends AbstractComponent implements OnInit {
  @Input() pageStore: PebPageStore;
  @Input() editor: EditorState;
  @Input() pages: NavbarPageInterface[];
  @Output() readonly documentSave = new EventEmitter<any>();
  @Output() readonly undo = new EventEmitter();
  @Output() readonly redo = new EventEmitter();
  @Output() readonly changedSelectedScreenView = new EventEmitter<NavbarSelectInterface>();
  @Output() readonly enablePreviewMode = new EventEmitter();
  @Output() readonly togglePagesType = new EventEmitter();

  PebPageType = PebPageType;

  widgetObjectsButtonData: NavbarCategoryData[] = [
    {
      label: 'Shapes',
      featureFlagName: 'add_widget.shape_group',
      items: [
        {
          value: 'Line',
          template: '<div class="shape-line"></div>',
          containerClass: 'shapes-container',
          // onClick: () => this.elementsFactory.createShape(ShapesElementTypes.Line),
          onClick: () => null,
        },
        {
          value: 'Circle',
          template: '<div class="shape-circle"></div>',
          containerClass: 'shapes-container',
          // onClick: () => this.elementsFactory.createShape(ShapesElementTypes.Circle),
          onClick: () => null,
        },
        {
          value: 'Round',
          template: '<div class="shape-round"></div>',
          containerClass: 'shapes-container',
          // onClick: () => this.elementsFactory.createShape(ShapesElementTypes.Round),
          onClick: () => null,
        },
        {
          value: 'Box',
          template: '<div class="shape-box"></div>',
          containerClass: 'shapes-container',
          // onClick: () => this.elementsFactory.createShape(ShapesElementTypes.Rectangle),
          onClick: () => null,
        },
      ],
    },
    {
      label: 'Buttons',
      items: [
        {
          value: 'Button',
          button: {
            text: 'Button',
          },
          // onClick: (): void => this.elementsFactory.createButton(ButtonElementTypes.Button),
          onClick: () => null,
        },
      ],
    },
    {
      label: 'Dropdown',
      items: [
        {
          value: 'Dropdown',
          button: {
            text: 'Dropdown',
            icon: '#icon-arrow-down-small-16',
          },
          // onClick: (): void => this.elementsFactory.createButton(ButtonElementTypes.DropDown),
          onClick: () => null,
        },
      ],
    },
    {
      label: 'Cart',
      items: [
        {
          value: 'Cart',
          icon: '#icon-checkout-24',
          // onClick: (): void => this.elementsFactory.createCart(),
          onClick: () => null,
        },
        ...(this.themeData.applicationType === 'pos'
          ? [{
            value: 'Amount',
            button: {
              text: this.translateService.translate('widgets.amount_name'),
            },
            // onClick: (): void => this.elementsFactory.createAmount(),
            onClick: () => null,
          }]
          : []
        ),
      ],
    },
    {
      label: 'Logo',
      items: [
        {
          value: 'Logo',
          icon: '#icon-logo-24',
          // onClick: (): void => this.elementsFactory.createLogo(),
          onClick: () => null,
        },
      ],
    },
  ];

  widgetMediaButtonData: NavbarMenuItemInterface[] = [
    {
      value: NavbarMenuItemMediaEnum.Picture,
      label: 'website_editor.system_header.widgets_section.media.picture',
      featureFlagName: 'add_widget.image',
    },
    {
      value: NavbarMenuItemMediaEnum.Video,
      label: 'website_editor.system_header.widgets_section.media.video',
      featureFlagName: 'add_widget.video',
    },
    {
      value: NavbarMenuItemMediaEnum.Carousel,
      label: 'website_editor.system_header.widgets_section.media.carousel',
    },
  ];

  constructor(
    public elementsFactory: ElementsFactory,
    public themeStore: PebThemeStore,
    private blobUploadService: BlobUploadService,
    private imageUploadService: ImageUploadService,
    private snackbarService: SnackbarService,
    private productsService: ProductsService,
    private themeData: ThemeData,
    private translateService: TranslateService,
    @Inject(ELEMENTS_REGISTRY) private elementsRegitry: ElementsRegistry,
    private builderMediaSidebarApi: BuilderMediaSidebarApi,
  ) {
    super();
  }

  get businessId(): string {
    return this.themeData.context.businessId;
  }

  get applicationId(): string {
    return this.themeData.context.applicationId;
  }

  ngOnInit(): void {
    // TODO: This should be belong to ThemePage component and use separate services
    // this.elementsRegitry.events$
    //   .pipe(
    //     filter(
    //       (event: EditorEventInterface) => event.type === 'click' && event.payload.initiator && event.payload.selected,
    //     ),
    //     tap((events: EditorEventInterface) => {
    //       if (
    //         events.payload.component.element.type === PebElementType.Image
    //         // events.payload.component.element.type === PebElementType.Video
    //       ) {
    //         this.onReplaceMedia(events.payload.definition, events.payload.component.element.type);
    //       }
    //     }),
    //     filter(() => this.themeStore.activePageSubject$.value.type !== PebPageType.Master),
    //     tap((events: EditorEventInterface) => {
    //       if (events.payload.component.element.type === PebElementType.Product) {
    //         this.productsService.addProduct(this.pageStore, this.editor, this.themeStore);
    //       }
    //     }),

    //     takeUntil(this.destroyed$),
    //   )
    //   .subscribe();
  }

  mediaItemClicked(item: NavbarMenuItemInterface<NavbarMenuItemMediaEnum>): void {
    // switch (item.value) {
    //   case NavbarMenuItemMediaEnum.Picture:
    //     this.onAddImage();
    //     break;
    //   case NavbarMenuItemMediaEnum.Carousel:
    //     this.onAddCarousel();
    //     break;
    //   case NavbarMenuItemMediaEnum.Video:
    //     this.onAddVideo();
    //     break;
    //   default:
    //     break;
    // }
  }

  onReplaceMedia(element: PebElement, type: 'image' | 'video'): void {
    // this.imageUploadService
    //   .selectImage()
    //   .pipe(
    //     filter((file: File) => {
    //       this.pageStore.updateElement(element.id, { meta: { loading: true } });
    //       if (file.size <= 1024 * 1024 * 5) {
    //         return true;
    //       }
    //       this.snackbarService.open(SnackbarComponent, 'Maximum size exceeded');

    //       return false;
    //     }),
    //     switchMap((file: File) => this.builderMediaSidebarApi.uploadMedia(file)),
    //     tap(src => {
    //       this.pageStore.updateElement(element.id, {
    //         data: {
    //           src,
    //           ...(type === 'video' && { previewUrl: `${src}_preview` }),
    //         },
    //         meta: { loading: false },
    //       });
    //     }),
    //     takeUntil(this.destroyed$),
    //   )
    //   .subscribe();
  }

  onReplaceVideo(element: PebElement): void {
    // this.imageUploadService
    //   .selectImage()
    //   .pipe(
    //     filter((file: File) => {
    //       this.pageStore.updateElement(element.id, { meta: { loading: true } });
    //       const isSizeValid: boolean = this.imageUploadService.checkImage(file, false);
    //       if (isSizeValid) {
    //         return true;
    //       }
    //       this.snackbarService.open(SnackbarComponent, 'Maximum size exceeded');

    //       return false;
    //     }),
    //     switchMap((file: File) => {
    //       return this.blobUploadService.createBlob(this.businessId, file).pipe(
    //         map((blobURL: string) => ({ blobURL, element })),
    //         catchError(() => {
    //           this.pageStore.removeElements([element.id]);

    //           return throwError(element);
    //         }),
    //       );
    //     }),
    //     tap(({ blobURL }: { blobURL: string }) => {
    //       this.pageStore.updateElement(element.id, {
    //         data: { src: blobURL },
    //         meta: { loading: false },
    //       });
    //     }),
    //     takeUntil(this.destroyed$),
    //   )
    //   .subscribe();
  }

  onAddVideo(): void {
    // this.elementsFactory.createVideo();
  }

  onAddImage(): void {
    // this.elementsFactory.createImage();
    // this.imageUploadService
    //   .selectImage()
    //   .pipe(
    //     filter((file: File) => {
    //       const isSizeValid: boolean = this.imageUploadService.checkImage(file, false);
    //       if (isSizeValid) {
    //         return true;
    //       }
    //       this.snackbarService.open(SnackbarComponent, 'Maximum size exceeded');

    //       return false;
    //     }),
    //     switchMap((file: File) => {
    //       const elementToAppend: EditorAppendElementInterface = this.editor.findElementToAppend();

    //       return this.blobUploadService.createImageElement(file, elementToAppend);
    //     }),
    //     // tslint:disable-next-line:typedef
    //     tap(({ file, element }) => this.elementsFactory.appendEditorElement(element)),
    //     switchMap(({ file, element }: { file: File; element: PebElement }) => {
    //       return this.blobUploadService.createBlob(this.businessId, file).pipe(
    //         map((blobURL: string) => ({ blobURL, element })),
    //         catchError(() => {
    //           this.pageStore.removeElements([element.id]);

    //           return throwError(element);
    //         }),
    //       );
    //     }),
    //     tap(({ blobURL, element }: { blobURL: string; element: PebElement }) => {
    //       this.pageStore.updateElement(element.id, {
    //         data: { src: blobURL },
    //         meta: { loading: false },
    //       });
    //     }),
    //     takeUntil(this.destroyed$),
    //   )
    //   .subscribe();
  }

  onAddCarousel(): void {
    // this.blobUploadService
    //   .selectImages()
    //   .pipe(
    //     filter((files: File[]) => {
    //       const isSizeValid = files.every((file: File) => this.imageUploadService.checkImage(file, false));
    //       if (isSizeValid) {
    //         return true;
    //       }
    //       this.snackbarService.open(SnackbarComponent, 'Maximum size exceeded');

    //       return false;
    //     }),
    //     switchMap((files: File[]) => {
    //       const elementToAppend: EditorAppendElementInterface = this.editor.findElementToAppend();

    //       return this.blobUploadService.createCarouselElement(files, elementToAppend);
    //     }),
    //     // tslint:disable-next-line:typedef
    //     tap(({ element }) => this.elementsFactory.appendEditorElement(element)),
    //     // tslint:disable-next-line:typedef
    //     switchMap(({ files, element }) => {
    //       return forkJoin(
    //         files.map((file: File) => {
    //           return this.blobUploadService.createBlob(this.businessId, file).pipe(
    //             map((blobURL: string) => ({ blobURL, element })),
    //             catchError(() => {
    //               this.pageStore.removeElements([element.id]);

    //               return throwError(element);
    //             }),
    //           );
    //         }),
    //       );
    //     }),
    //     tap((result: any[]) => {
    //       let el;
    //       // tslint:disable-next-line:typedef
    //       const sources = result.map(({ blobURL, element }) => {
    //         el = element;

    //         return blobURL;
    //       });

    //       this.pageStore.updateElement(el.id, {
    //         data: { sources },
    //         meta: { loading: false },
    //       });
    //     }),
    //     takeUntil(this.destroyed$),
    //   )
    //   .subscribe();
  }

  onToggleSidebar(position: 'left' | 'right'): void {
    this.editor.sidebarsDisplay = {
      ...this.editor.sidebarsDisplay,
      [position]: !this.editor.sidebarsDisplay[position],
    };
  }
}
