import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { FlatTreeControl } from '@angular/cdk/tree';
import { ChangeDetectorRef, Component, ElementRef, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Select, Store } from '@ngxs/store';
import { Observable, merge } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { PebDeleteElementAction } from '@pe/builder/actions';
import { PebControlsService } from '@pe/builder/controls';
import { OVERLAY_POSITIONS } from '@pe/builder/core';
import { bboxDimension, calculatePebSizeToPixel, canAddText } from '@pe/builder/editor-utils';
import { PebElement } from '@pe/builder/render-utils';
import { PebCreateShapeService } from '@pe/builder/shapes';
import {
  PebCopyElementsAction,
  PebElementsState,
  PebPasteElementsAction,
  PebPatchEditTextAction,
  PebSelectAction,
  PebSetSidebarsAction,
  PebUpdateAction,
} from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';
import { SnackbarService } from '@pe/snackbar';

import { transformer } from './layers.functions';
import { LayerFlatNode, LayerNodeType, LayerSingleNode } from './layers.interfaces';

@Component({
  selector: 'pe-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.scss'],
  providers: [PeDestroyService],
})
export class PebLayersComponent {
  @Select(PebElementsState.document) document$!: Observable<PebElement>;
  @Select(PebElementsState.selectedElements) selectedElements$!: Observable<PebElement[]>;

  treeControl = new FlatTreeControl<LayerFlatNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  editingNode?: string;
  LayerNodeType = LayerNodeType;

  private loadDataPage$ = this.document$.pipe(
    filter(root => !!root),
    tap(root => this.loadDataSource(root)),
  );

  private selectElements$ = this.selectedElements$.pipe(
    tap(elements => this.selectTreeNodes(elements))
  );

  private treeNodes = new Map<string, LayerFlatNode>();
  private overlayRef: OverlayRef;

  @ViewChild('layersMenu') private layerMenuTemplateRef: TemplateRef<any>;
  @ViewChild('textInput') private textInput?: ElementRef<HTMLInputElement>;

  constructor(
    private readonly chRef: ChangeDetectorRef,
    private readonly store: Store,
    private readonly controlsService: PebControlsService,
    private readonly overlay: Overlay,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly snackbarService: SnackbarService,
    private readonly createShape: PebCreateShapeService,
    private readonly destroy$: PeDestroyService,
  ) {
    merge(this.loadDataPage$, this.selectElements$).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private loadDataSource(root: PebElement): void {
    const expandedNodeIds = this.treeControl.dataNodes
      ? this.treeControl.dataNodes.filter(node => this.treeControl.isExpanded(node)).map(node => node.id)
      : [];
    const selectedNodes = this.store.selectSnapshot<PebElement[]>(PebElementsState.selectedElements);

    const data = [...root.children ?? []].map(child => new LayerSingleNode(child));
    this.dataSource.data = data;

    this.treeNodes.clear();
    this.treeControl.dataNodes.forEach(node => this.treeNodes.set(node.id, node));

    this.selectTreeNodes(selectedNodes);
    expandedNodeIds.forEach(nodeId => this.treeControl.expand(this.treeControl.dataNodes.find(x => x.id === nodeId)));
  }

  private selectTreeNodes(elements: PebElement[]): void {
    this.deselectAllTreeNodes();

    elements.filter(elm => !!elm).forEach((element) => {
      const node = this.treeNodes.get(element.id);

      if (node) {
        node.isSelected = true;
      }

      this.expandToTreeItem(element.id);
      this.chRef.detectChanges();
    });
  }

  private deselectAllTreeNodes(): void {
    this.treeNodes.forEach(node => node.isSelected = false);
  }

  private expandToTreeItem(id: string): void {
    const item = this.treeNodes.get(id);

    if (item) {
      if (item.expandable) {
        this.treeControl.expand(item);
      }

      if (item.parent) {
        this.expandToTreeItem(item.parent);
      }
    }
  }

  close(): void {
    this.store.dispatch(new PebSetSidebarsAction({ layers: false }));
  }

  selectTreeNode(node: LayerFlatNode, event?: MouseEvent): void {
    if (!event?.shiftKey) {
      this.deselectAllTreeNodes();
    }

    if (!node.isVisible) {
      return;
    }

    node.isSelected = true;
    this.selectElements();
  }

  private selectElements(): void {
    const treeNodes = [...this.treeNodes.values()].filter(x => x.isSelected);
    const newSelectedElements: PebElement[] = [];

    treeNodes.forEach(node => newSelectedElements.push(...node.elements));

    this.store.dispatch(new PebSelectAction(newSelectedElements));

    const controls = this.controlsService.createDefaultControlsSet(newSelectedElements);

    this.controlsService.renderControls(controls);
  }

  toggleVisible(node: LayerFlatNode, event: MouseEvent): void {
    if (!node.canChangeVisible) {
      return;
    }
    event.stopPropagation();

    node.isVisible = !node.isVisible;
    node.isSelected = false;

    const ids = node.elements.map(elm => elm.original?.id || elm.id);
    this.toggleElementVisibility(ids, node.isVisible);
  }

  private toggleElementVisibility(ids: string[], visible: boolean): void {
    const stylesPayload = ids.map(id => ({ id, styles: { display: visible ? 'block' : 'none' } }));
    this.store.dispatch([new PebUpdateAction(stylesPayload)]);
  }

  editTreeNode(node: LayerFlatNode): void {
    if (node.type === LayerNodeType.Group) {
      return;
    }

    this.editingNode = node.id;
    this.closeContextMenu();
    this.chRef.detectChanges();

    this.textInput?.nativeElement.focus();
  }

  changeName(name: string, node: LayerFlatNode): void {
    const elements = this.store.selectSnapshot(PebElementsState.elementsByName);
    const [element] = node.elements;

    if (element.name === name) {
      this.editingNode = undefined;

      return;
    }

    if (!elements.has(name.toLowerCase())) {
      const payload = { id: this.editingNode, name };
      this.store.dispatch(new PebUpdateAction([payload]));

      this.editingNode = undefined;
    } else {
      this.snackbarService.toggle(true, {
        content: 'Invalid name',
        duration: 2000,
        iconId: 'icon-commerceos-error',
      });
    }
  }

  openContextMenu(ev: MouseEvent, item: LayerFlatNode) {
    this.selectTreeNode(item);

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
      backdropClass: 'peb-context-menu',
    });

    this.overlayRef.backdropClick().pipe(
      tap(() => this.overlayRef.dispose()),
      takeUntil(this.destroy$),
    ).subscribe();

    const portal = new TemplatePortal(this.layerMenuTemplateRef, this.viewContainerRef, { $implicit: item });
    this.overlayRef.attach(portal);
  }

  closeContextMenu() {
    this.overlayRef?.dispose();
  }

  delete(item: LayerFlatNode): void {
    this.closeContextMenu();
    this.store.dispatch(new PebDeleteElementAction());
  }

  getShapeIconStyles(element: PebElement): Partial<CSSStyleDeclaration> {
    let { width, height } = bboxDimension(element);

    if (Number.isNaN(width)) {
      width = calculatePebSizeToPixel([element.styles.dimension?.width ?? 0], 100)[0];
    }

    if (Number.isNaN(height)) {
      height = calculatePebSizeToPixel([element.styles.dimension?.height ?? 0], 100)[0];
    }

    const max = 18;
    const horizontal = width > height;
    let scale: number;

    if (horizontal) {
      scale = max / width;
    } else {
      scale = max / height;
    }

    const borderRadius = element.styles?.borderRadius ? +element.styles?.borderRadius : 0;

    return {
      width: `${width * scale}px`,
      height: `${height * scale}px`,
      border: '1px solid',
      borderRadius: element.meta?.borderRadiusDisabled ? '50%' : `${borderRadius * scale}px`,
    };
  }

  copy(): void {
    this.store.dispatch(new PebCopyElementsAction());
    this.closeContextMenu();
  }

  paste(): void {
    this.store.dispatch(new PebPasteElementsAction());
    this.closeContextMenu();
  }

  save(): void {
    const selectedElements = this.store.selectSnapshot(PebElementsState.selected);
    this.createShape.openCreateDialog(selectedElements);
    this.closeContextMenu();
  }

  canEditText(element: PebElement): boolean {
    return canAddText(element);
  }

  enableEditText(node: LayerFlatNode) {
    this.store.dispatch(new PebPatchEditTextAction({ enabled: true, element: node.elements[0] }));
    this.closeContextMenu();
  }

}
