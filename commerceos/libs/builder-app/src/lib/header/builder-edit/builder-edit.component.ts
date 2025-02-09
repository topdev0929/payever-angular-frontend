import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { PebLanguagesFormComponent, PebSeoForm } from '@pe/builder/forms';
import { PebEditorScriptsDialog } from '@pe/builder/main-editor';
import { PebSideBarService } from '@pe/builder/services';



export const EDIT_OPTION = [
  {
    title: 'Language',
    disabled: false,
    active: false,
    image: '/assets/builder-app/icons/manage-languages.png',
    option: 'toggleLanguagesSidebar',
  },
  {
    title: 'SEO',
    disabled: false,
    active: false,
    image: '/assets/builder-app/icons/seo.svg',
    option: 'toggleSeoSidebar',
  },
  {
    title: 'Scripts',
    disabled: false,
    active: false,
    image: '/assets/builder-app/icons/scripts.svg',
    option: 'openScriptsDialog',
  },
];


@Component({
  selector: 'pe-shop-builder-edit',
  templateUrl: './builder-edit.component.html',
  styleUrls: ['./builder-edit.component.scss'],
})
export class PeShopBuilderEditComponent {

  readonly options = EDIT_OPTION;

  constructor(
    private dialogRef: MatDialogRef<PeShopBuilderEditComponent>,
    private readonly sideBarService: PebSideBarService,
    private dialog: MatDialog,
  ) {
  }

  onCloseClick() {
    this.dialogRef.close();
  }

  setValue(item) {
    switch (item.option) {
      case 'toggleLanguagesSidebar':
        this.sideBarService.openDetail(
          PebLanguagesFormComponent,
          { backTitle: 'Back', title: 'Languages' },
        );
        break;

      case 'openScriptsDialog':
        this.dialog.open(PebEditorScriptsDialog, {
          panelClass: ['scripts-dialog__panel'],
          width: '436px',
        });
        break;

      case 'toggleSeoSidebar':
        this.sideBarService.openDetail(
          PebSeoForm,
          { backTitle: 'Back', title: 'SEO' },
        );
        break;

      default:
        break;
    }

    this.dialogRef.close();
  }
}
