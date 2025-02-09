import { Component, Input, ViewEncapsulation } from '@angular/core';
import { DialogPosition, MatDialog } from '@angular/material';

import { PebPageStore } from '@pe/builder-core';
import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { BuilderThemeComponent } from '../../../root/theme.component';
import { PublishDialogComponent } from '../../dialogs/publish-dialog/publish-dialog.component';

@Component({
  selector: 'pe-builder-theme-publish-button',
  templateUrl: './theme-publish-button.component.html',
  styleUrls: ['./theme-publish-button.component.scss'],
  // tslint:disable-next-line:use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
})
export class ThemePublishButtonComponent {
  @Input() pageStore: PebPageStore;
  @Input() editor: EditorState;

  constructor(
    private matDialog: MatDialog,
    private themeCmp: BuilderThemeComponent,
  ) {}

  onClick(event: any): void {
    const buttonNode: HTMLElement = event.target;
    const buttonRect = buttonNode.getBoundingClientRect();
    const position: DialogPosition = {
      top: `${buttonRect.top + buttonRect.height + 5}px`,
      right: `${document.body.clientWidth - buttonRect.right}px`,
    };

    this.matDialog.open(PublishDialogComponent, {
      position,
      backdropClass: 'dialog-backdrop',
      panelClass: 'dialog-publish-panel',
      viewContainerRef: this.themeCmp.viewRef,
    });
  }
}
