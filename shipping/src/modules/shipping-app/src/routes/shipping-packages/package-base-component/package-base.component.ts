import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy, ViewContainerRef, ChangeDetectorRef,
} from '@angular/core';
import { AbstractComponent } from '../../../misc/abstract.component';
import { OVERLAY_POSITIONS } from '../../../constants';
import { catchError, tap } from 'rxjs/operators';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { PebShippingPackagesService } from '../shipping-packages.service';
import { TranslateService } from '@pe/i18n-core';

export class PebPackageBaseComponent extends AbstractComponent implements OnInit, OnDestroy {
  contextMenuClickedItem: any;
  editItemAction: any;
  dataGrid: any;
  contextRef: OverlayRef;
  contextActions = [];
  constructor(
    protected overlay: Overlay,
    protected viewContainerRef: ViewContainerRef,
    protected packageService: PebShippingPackagesService,
    protected cdr: ChangeDetectorRef,
    protected translateService: TranslateService) {
    super(translateService);
  }

  ngOnInit(){
  }

  getItems() {
  }

  openContextMenu(event: any, item, context) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();

      this.contextMenuClickedItem = item || null;
      this.contextRef = this.overlay.create({
        positionStrategy: this.overlay
          .position()
          .flexibleConnectedTo(event)
          .withFlexibleDimensions(false)
          .withViewportMargin(10)
          .withPositions(OVERLAY_POSITIONS),
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
        hasBackdrop: true,
        backdropClass: 'connect-context-menu-backdrop',
      });

      this.contextRef.backdropClick().pipe(
        tap(() => this.closeContextMenu()),
      ).subscribe();

      this.contextRef.attach(new TemplatePortal(context, this.viewContainerRef));
    }
  }

  onDeleteItem = (e) => {
    if (this.contextMenuClickedItem) {
      this.packageService
        .deletePackage(this.contextMenuClickedItem.id)
        .pipe(
          tap((_) => {
            this.getItems();
            this.dataGrid.selectedItems = [];
            this.cdr.detectChanges();
          }),
          catchError((err) => {
            throw new Error(err);
          }),
        )
        .subscribe();
      this.contextRef.dispose();
      this.cdr.detectChanges();
    }
  }

  onEditItem = (event) => {
    if (this.contextMenuClickedItem) {
      this.editItemAction.callback(this.contextMenuClickedItem.id);
      this.contextRef.dispose();
      this.cdr.detectChanges();
    }
  }

  onDuplicateItem = (e) => {
    if (this.contextMenuClickedItem) {
      const data = {
        name: this.contextMenuClickedItem.data.name,
        business: this.contextMenuClickedItem.data.business,
        dimensionUnit: this.contextMenuClickedItem.data.dimensionUnit,
        weightUnit: this.contextMenuClickedItem.data.weightUnit,
        type: this.contextMenuClickedItem.data.type,
        length: this.contextMenuClickedItem.data.length,
        width: this.contextMenuClickedItem.data.width,
        height: this.contextMenuClickedItem.data.height,
        weight: this.contextMenuClickedItem.data.weight,
        isDefault: this.contextMenuClickedItem.data.isDefault,
      };
      this.packageService
        .addPackage(data)
        .pipe(
          tap((_) => {
            this.getItems();
            this.cdr.detectChanges();
          }),
          catchError((err) => {
            throw new Error(err);
          }),
        )
        .subscribe();
      this.contextRef.dispose();
      this.cdr.detectChanges();
    }
  }

  closeContextMenu() {
    if (this.contextRef) {
      this.contextRef.dispose();
    }
  }

  fillContextMenu() {
    this.contextActions = [
      {
        label: 'Edit',
        callback: this.onEditItem,
      },
      {
        label: 'Delete',
        callback: this.onDeleteItem,
      },
      {
        label: 'Duplicate',
        callback: this.onDuplicateItem,
      },
    ];
  }
}
