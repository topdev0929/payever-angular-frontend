import { Component, Input, ViewEncapsulation } from '@angular/core';
import { DialogPosition, MatDialog } from '@angular/material';

import { PebPageStore } from '@pe/builder-core';
import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { NavbarPageInterface } from '../../../entities/navbar';
import { BuilderThemeComponent } from '../../../root/theme.component';
import { SeoDialogComponent } from '../../dialogs/seo-dialog/seo-dialog.component';

@Component({
  selector: 'pe-builder-seo-button',
  templateUrl: './seo-button.component.html',
  styleUrls: ['./seo-button.component.scss'],
  // tslint:disable-next-line:use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
})
export class SeoButtonComponent {
  @Input() pageStore: PebPageStore;
  @Input() editor: EditorState;
  @Input() pages: NavbarPageInterface[];

  constructor(private readonly themeCmp: BuilderThemeComponent, private readonly matDialog: MatDialog) {}

  onClicked(event: any): void {

    const buttonNode: HTMLElement = event.target;
    const buttonRect = buttonNode.getBoundingClientRect();
    const position: DialogPosition = {
      top: `${buttonRect.top + buttonRect.height + 5}px`,
      right: `${document.body.clientWidth - buttonRect.right}px`,
    };

    this.matDialog.open(SeoDialogComponent, {
      position,
      backdropClass: 'dialog-backdrop',
      panelClass: 'dialog-panel',
      viewContainerRef: this.themeCmp.viewRef,
    });
  }
}
