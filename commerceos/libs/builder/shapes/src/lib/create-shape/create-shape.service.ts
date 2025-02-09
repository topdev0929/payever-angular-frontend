import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';

import { PebElementDef, PebShape, pebGenerateId } from '@pe/builder/core';
import { PebElement, cloneElementDef } from '@pe/builder/render-utils';
import { PebEditorState } from '@pe/builder/state';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { PebCreateShapeDialog } from './create-shape.dialog';

@Injectable()
export class PebCreateShapeService {
  private dialogRef: PeOverlayRef;

  constructor(
    private readonly overlayService: PeOverlayWidgetService,
    private readonly store: Store,
    private readonly translateService: TranslateService,
  ) {
  }

  openEditDialog(shape: PebShape) {
    return this.openDialogWithShape(shape, true);
  }

  openCreateDialog(elements: PebElement[]) {
    const defs = this.getElementDefs(elements);
    const shape = {
      id: pebGenerateId(),
      elements: defs,
      title: this.translateService.translate('builder-app.shapes.new_shape'),
      basic: false,
      type: 'template',
      album: null,
    };

    return this.openDialogWithShape(shape, false);
  }

  private openDialogWithShape(shape: PebShape, isUpdate: boolean) {
    const saveSubject$ = new BehaviorSubject<void>(null);

    const config: PeOverlayConfig = {
      component: PebCreateShapeDialog,
      hasBackdrop: true,
      backdropClick: () => {},
      headerConfig: {
        title: this.translateService.translate('builder-app.shapes.save_shape'),
        doneBtnTitle: this.translateService.translate('builder-app.actions.save'),
        backBtnTitle: this.translateService.translate('builder-app.actions.cancel'),
        doneBtnCallback: () => {
          saveSubject$.next();
          this.dialogRef.close();
        },
        backBtnCallback: () => {
          this.dialogRef.close();
        },
        onSaveSubject$: saveSubject$,
        theme: 'dark',
      },
      data: { shape, isUpdate },
    };

    this.dialogRef = this.overlayService.open(config);

    return this.dialogRef;
  }

  private getElementDefs(selected: PebElement[]): PebElementDef[] {
    const elements = this.store.selectSnapshot(PebEditorState.elements);
    const selectedIds = selected.map(elm => elm.id);
    const insideElements: PebElement[] = [];
    const queue = [...selected];

    while (queue.length) {
      const child = queue.pop();
      if (child) {
        insideElements.push(child);
        queue.push(...child.children ?? []);
      }
    }
    const elementDefs = insideElements
      .map(elm => cloneElementDef(elements[elm.id], selectedIds.includes(elm.id)))
      .filter(Boolean);

    return elementDefs;
  }
}