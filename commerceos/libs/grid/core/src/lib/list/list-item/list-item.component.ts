import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  HostListener,
  Inject,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import ResizeObserver from 'resize-observer-polyfill';
import { BehaviorSubject } from 'rxjs';

import { EnvironmentConfigInterface, PE_ENV, PeDestroyService, PeHelpfulService } from '@pe/common';
import { TranslateService } from '@pe/i18n';

import { PeGridMenuService } from '../../menu';
import { GridMobileItemClassDirective } from '../../misc/classes/mobile-item.class';
import { PeGridMenuPosition, PeGridView } from '../../misc/enums';
import { PeGridItem, PeGridItemType, PeGridMenuConfig, PeGridTableDisplayedColumns } from '../../misc/interfaces';
import { PeListImagesService } from '../../misc/services/list-images.service';
import { PeGridViewportService } from '../../viewport';

@Component({
  selector: 'pe-grid-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
  providers: [PeDestroyService],
})
export class PeGridListItemComponent extends GridMobileItemClassDirective implements OnChanges {
  readonly peGridView = PeGridView;

  image = null;
  text: SafeHtml;
  resizeObserver: ResizeObserver;
  imageLoad$ = new BehaviorSubject<boolean>(true);

  @Input() toAdd = false;
  @Input() excludeColumns: string[] = [];
  @Input() previewTitle = this.translateService.translate('grid.items.preview');
  @Input() disableContextMenu = false;
  @Input() disableSelect = false;
  @Input() template: TemplateRef<PeGridItem>;
  @Input() displayColumns: PeGridTableDisplayedColumns[] = [];
  @Input() autoHeightImage = false;
  @Input() defaultImageTemplate: TemplateRef<HTMLImageElement> = null;

  @ViewChild('gridItem', { static: false }) gridItemRef: ElementRef;
  @ViewChild('imageRef', { static: false }) imageRef: ElementRef<HTMLImageElement>;
  @ViewChild('textBlock', { static: false }) textBlock: ElementRef;
  @ViewChild('moreButton') moreButtonRef: ElementRef;

  @ContentChild('footerRight') footerRightRef: TemplateRef<HTMLElement>;

  readonly peGridItemType: typeof PeGridItemType = PeGridItemType;

  @HostListener('click', ['$event']) clicked(e: PointerEvent) {
    this.itemClick.emit(this.item);
  }

  @HostListener('contextmenu', ['$event']) onContextMenu(e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (this.disableContextMenu) { return; }

    if (!this.toAdd) {
      this.openContextMenu(e);
    }
  }

  get folderIcon() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.env.custom.cdn + '/icons/app-icon-folder.svg');
  }

  get isMobile(): boolean {
    return document.body.clientWidth <= 720;
  }

  constructor(
    public peGridViewportService: PeGridViewportService,
    protected injector: Injector,
    protected menuService: PeGridMenuService,
    protected destroy$: PeDestroyService,
    private gridHelpfulService: PeHelpfulService,
    private sanitizer: DomSanitizer,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private peListImagesService: PeListImagesService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {
    super(injector);
  }

  get isTopBadge(): boolean {
    return this.peGridViewportService.view === PeGridView.List;
  }

  get isBottomBadge(): boolean {
    return this.peGridViewportService.view !== PeGridView.List;
  }

  get isStaticFooter(): boolean {
    return this.peGridViewportService.view === PeGridView.BigList ||
      this.peGridViewportService.view === PeGridView.BigListCover;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { itemContextMenu, item, displayColumns } = changes;

    if (displayColumns?.currentValue) {
      this.displayColumns = displayColumns.currentValue;
    }

    if (itemContextMenu?.currentValue) {
      this.itemContextMenu = itemContextMenu.currentValue;
    }

    if (item?.currentValue?.image && !item?.currentValue?.useDefaultImage) {
      this.gridHelpfulService.isValidImgUrl(item.currentValue.image).then((res) => {
        if (res.status === 200) {
          this.peListImagesService.imagesLoad.push(this.imageLoad$);
          this.peListImagesService.addNewImageLoader$.next(true);

          this.image = item.currentValue.image;

          if (this.imageRef?.nativeElement) {
            this.imageRef.nativeElement.onload = () => {
              this.imageLoad$.next(false);
            };
            this.imageRef.nativeElement.onerror = () => {
              this.imageLoad$.next(false);
            };
            this.imageRef.nativeElement.src = item.currentValue.image.split('/').pop() === 'employee-default-icon.png'
              ? './assets/icons/contact-grid.png'
              : item.currentValue.image;
          }

          this.cdr.markForCheck();
        }
      });
    }

    if (item?.currentValue?.data?.text) {
      this.text = item.currentValue.data.text;
    }
  }

  onPreview(e: Event, item: PeGridItem): void {
    e.stopPropagation();
    this.preview.emit(item);
  }

  getMenuConfig(offsetX = 0, offsetY = 0, position: PeGridMenuPosition, minWidth?: number): PeGridMenuConfig {
    const config: PeGridMenuConfig = {
      offsetX,
      offsetY,
      position,
    };

    return minWidth ? { minWidth, ...config } : config;
  }

  public clickedMore(event: PointerEvent): void {
    event.stopPropagation();
    if (!this.toAdd && !this.item.isLoading$?.value) {
      this.openContextMenu(event, this.moreButtonRef);
    }
  }

  public selectItem(event: PointerEvent, item: PeGridItem): void {
    event.stopPropagation();
    this.peGridViewportService.onSelect(event, item);
  }
}
