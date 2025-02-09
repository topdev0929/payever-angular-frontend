import { CdkDragDrop, CdkDragMove } from '@angular/cdk/drag-drop';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { FlatTreeControl } from '@angular/cdk/tree';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map, take, takeUntil, tap } from 'rxjs/operators';

import { PebCreateEmptyPageAction, PebRenderPebElementsAction } from '@pe/builder/actions';
import { OVERLAY_POSITIONS, PebPage, PebPageVariant, PebScreen } from '@pe/builder/core';
import { PebPagesComponent } from '@pe/builder/pages';
import { PebPreviewRendererService } from '@pe/builder/preview-renderer';
import { EditorSidebarTypes } from '@pe/builder/services';
import {
  PebEditorState,
  PebOptionsState,
  PebPagesState,
  PebSetSidebarsAction,
  PebUpdatePagesAction,
} from '@pe/builder/state';
import { PebViewIntegrationClearCacheAction } from '@pe/builder/view-actions';
import { PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';

import { PEB_DROP_PROXIMITY_THRESHOLD, PebDraggedOverPosition } from './constants';
import { PebPageListItem, PebPageListItemFlat } from './page-list';
import { PebPageListService } from './page-list.service';


@Component({
  selector: 'peb-page-list',
  templateUrl: './page-list.component.html',
  styleUrls: ['./page-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebPageListComponent {
  flatNodeMap = new Map<PebPageListItemFlat, PebPageListItem>();
  nestedNodeMap = new Map<PebPageListItem, PebPageListItemFlat>();
  treeControl: FlatTreeControl<PebPageListItemFlat>;
  treeFlattener: MatTreeFlattener<PebPageListItem, PebPageListItemFlat>;
  dataSource: MatTreeFlatDataSource<PebPageListItem, PebPageListItemFlat>;

  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;

  @ViewChild('pageMenu') pageMenuTemplateRef: TemplateRef<any>;

  private readonly expanded = new Set<string>();

  private overlayRef: OverlayRef;
  pageList$ = this.pageListService.allPages$.pipe(
    map(pages => pages.filter(page => !page.master.isMaster)),
    tap(pages => this.dataSource.data = pages),
    tap(() => this.expandPages()),
  );

  previewImages = this.previewRendererService.preview;

  isDragging = false;
  draggedOverPage?: PebPageListItem;
  draggedOverPosition?: PebDraggedOverPosition;
  pebDraggedOverPosition = PebDraggedOverPosition;

  private dragPageResolver = {
    [PebDraggedOverPosition.Above]: () => this.placeAbovePage(),
    [PebDraggedOverPosition.Center]: () => this.makeChildren(),
    [PebDraggedOverPosition.Below]: () => this.placeBelowPage(),
  }

  private readonly getLevel = (node: PebPageListItemFlat) => node.level;
  private readonly isExpandable = (node: PebPageListItemFlat) => node.expandable;
  private readonly getChildren = (node: PebPageListItem): PebPageListItem[] => node.children;
  readonly hasChild = (_: number, _nodeData: PebPageListItemFlat) => _nodeData.expandable;

  private readonly treeItemTransformer = (node: PebPageListItem, level: number): PebPageListItemFlat => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.id === node.id
      ? existingNode
      : {} as PebPageListItemFlat;
    flatNode.id = node.id;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    flatNode.active = node.active;
    flatNode.name = node.name;
    flatNode.preview = node.preview;

    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);

    return flatNode;
  }

  constructor(
    private readonly confirmScreenService: ConfirmScreenService,
    private readonly destroy$: PeDestroyService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
    private readonly matDialog: MatDialog,
    private readonly overlay: Overlay,
    private readonly store: Store,
    private readonly pageListService: PebPageListService,
    private readonly snackbarService: SnackbarService,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly translateService: TranslateService,
    private readonly previewRendererService: PebPreviewRendererService,
    matIconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
  ) {
    const icons = {
      'small-close-icon': 'assets/icons/small-close-icon.svg',
      'side-menu-icon-cc': 'assets/icons/plus-icon.svg',
    };

    Object.entries(icons).forEach(([icon, path]) => {
      const url = domSanitizer.bypassSecurityTrustResourceUrl(path);
      matIconRegistry.addSvgIcon(icon, url);
    });

    this.previewRendererService.previewChanged$.pipe(
      tap(() => this.cdr.detectChanges()),
      takeUntil(this.destroy$),
    ).subscribe();

    this.treeFlattener = new MatTreeFlattener(this.treeItemTransformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<PebPageListItemFlat>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  private expandPages(): void {
    const expandedNodes = this.treeControl.dataNodes.filter(node => this.expanded.has(node.id));
    expandedNodes.forEach(node => this.treeControl.expand(node));
  }

  trackPage(index: number, page: PebPageListItem): string {
    return page.id;
  }

  delete(page: PebPageListItem): void {
    this.closeContextMenu();

    const pages = this.store.selectSnapshot(PebPagesState.pages);

    if (pages.length === 1) {
      this.snackbarService.toggle(true, {
        content: this.translateService.translate('builder-app.delete.delete_single_page_error'),
        duration: 2000,
        iconId: 'icon-alert-24',
      });
    } else if (page.variant === PebPageVariant.Front) {
      const headings: Headings = {
        title: this.translateService.translate('builder-app.pages.delete_page'),
        subtitle: this.translateService.translate('builder-app.delete.delete_home_page_warning'),
        confirmBtnText: this.translateService.translate('builder-app.pages.yes'),
        declineBtnText: this.translateService.translate('builder-app.pages.no'),
      };

      this.confirmScreenService.show(headings, true).pipe(
        filter(Boolean),
        tap(() => {
          this.pageListService.deletePage(page.id);
        }),
        take(1),
        takeUntil(this.destroy$),
      ).subscribe();
    } else {
      this.pageListService.deletePage(page.id);
    }
  }


  duplicate(page: PebPageListItem): void {
    this.closeContextMenu();
    this.pageListService.duplicatePage(page.id);
  }

  openDialog(): void {
    const themeId = this.store.selectSnapshot(PebEditorState.themeId);
    const dialogRef = this.matDialog.open(
      PebPagesComponent,
      {
        height: '82.3vh',
        maxWidth: '78.77vw',
        width: '78.77vw',
        panelClass: 'pages-dialog',
        data: { themeId },
      },
    );

    dialogRef.afterClosed().pipe(
      filter((page): page is { masterPage: { id: string } } => !!page),
      take(1),
      tap(({ masterPage }) => {
        this.store.dispatch(new PebCreateEmptyPageAction({
          masterPage: masterPage?.id,
        }));
      })
    ).subscribe();
  }

  openContextMenu(ev: MouseEvent, page: PebPageListItem) {
    ev.preventDefault();
    ev.stopPropagation();

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(ev)
        .withFlexibleDimensions(false)
        .withViewportMargin(10)
        .withPositions(OVERLAY_POSITIONS),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'peb-page-menu',
    });

    this.overlayRef.backdropClick().pipe(
      tap(() => this.overlayRef.dispose()),
      takeUntil(this.destroy$),
    ).subscribe();

    const portal = new TemplatePortal(this.pageMenuTemplateRef, this.viewContainerRef, { $implicit: page });
    this.overlayRef.attach(portal);
  }

  closeContextMenu() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }

  editMaster(page: PebPage) {
    this.closeContextMenu();
    const masterPageId = page.master?.page;
    masterPageId && this.navigateToPage(masterPageId);
  }

  navigateToPage(pageId: string) {
    this.router.navigate([], { queryParams: { pageId } });
  }

  close() {
    this.store.dispatch(new PebSetSidebarsAction({ [EditorSidebarTypes.Navigator]: false }));
  }

  toggleExpand(item: PebPageListItemFlat): void {
    this.treeControl.toggle(item);
    this.expanded.has(item.id) ? this.expanded.delete(item.id) : this.expanded.add(item.id);
  }

  private arrangePages(item: PebPageListItem): void {
    const parents = this.getPageParentIds(this.draggedOverPage);
    if (parents.includes(item.id)) {
      return;
    }

    const previousIndexId = item.id;
    const resolver = this.dragPageResolver[this.draggedOverPosition];
    const { parentId, currentIndexId } = resolver();

    this.store.dispatch(new PebUpdatePagesAction({ ...item.page, parentId }));
    this.store.dispatch(new PebViewIntegrationClearCacheAction());
    this.store.dispatch(new PebRenderPebElementsAction());

    this.pageListService.arrangePages(previousIndexId, currentIndexId);
  }

  private placeAbovePage(): { parentId?: string, currentIndexId: string } {
    const parentId = this.draggedOverPage.parentId;
    const currentIndexId = this.draggedOverPage.id;

    return { parentId, currentIndexId };
  }

  private makeChildren(): { parentId?: string, currentIndexId: string } {
    const parentId = this.draggedOverPage.id;
    const children = this.draggedOverPage.children;
    const currentIndexId = children?.length ? children[children.length - 1].id : parentId;

    return { parentId, currentIndexId };
  }

  private placeBelowPage(): { parentId?: string, currentIndexId: string } {
    const parentId = this.draggedOverPage.parentId;
    const currentIndexId = this.draggedOverPage.next ?? this.draggedOverPage.id;

    return { parentId, currentIndexId };
  }

  private getPageParentIds(page: PebPageListItem): string[] {
    const result = [];
    let parent = page.parent;
    while (parent) {
      result.push(parent.id);
      parent = parent.parent;
    }

    return result;
  }

  dragMoved({ pointerPosition }: CdkDragMove) {
    this.isDragging = true;
    const element = document.elementFromPoint(pointerPosition.x, pointerPosition.y);
    const itemClassName = 'list__container';
    const container = element.classList.contains(itemClassName) ? element : element.closest(`.${itemClassName}`);

    if (!container) {
      return;
    }

    const target = this.treeControl.dataNodes.find(node => node.id === container.id);
    this.draggedOverPage = this.flatNodeMap.get(target);

    const targetRect = container.getBoundingClientRect();
    const topThreshold = PEB_DROP_PROXIMITY_THRESHOLD * targetRect.height;
    const bottomThreshold = (1 - PEB_DROP_PROXIMITY_THRESHOLD) * targetRect.height;

    this.draggedOverPosition = PebDraggedOverPosition.Center;
    if (pointerPosition.y - targetRect.top < topThreshold) {
        this.draggedOverPosition = PebDraggedOverPosition.Above;
    } else if (pointerPosition.y - targetRect.top > bottomThreshold) {
        this.draggedOverPosition = PebDraggedOverPosition.Below;
    }
  }

  drop({ item }: CdkDragDrop<any>): void {
    if (!this.draggedOverPage) {
      this.clearDragInfo();

      return;
    }

    const draggedItemFlat = item.data;
    const draggedItem = this.flatNodeMap.get(draggedItemFlat);

    this.arrangePages(draggedItem);
    this.clearDragInfo();
  }

  private clearDragInfo() {
    this.draggedOverPosition = null;
    this.draggedOverPage = null;
    this.isDragging = false;
  }
}
