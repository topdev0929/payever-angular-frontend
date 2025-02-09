import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { NavbarPageInterface } from '../../../entities/navbar';

@Component({
  selector: 'pe-builder-navbar-pages',
  templateUrl: './navbar-pages.component.html',
  styleUrls: ['./navbar-pages.component.scss'],
})
export class NavbarPagesComponent {
  @Input()
  pages: NavbarPageInterface[];

  @Input()
  activePage: NavbarPageInterface;

  @Input()
  requestInProgress: boolean;

  @Input()
  editor: EditorState;

  @Output()
  readonly pageSelect = new EventEmitter<NavbarPageInterface>();

  @Output()
  readonly pageCreate = new EventEmitter<NavbarPageInterface>();

  @Output()
  readonly sectionCreate = new EventEmitter<any>();

  @Output()
  readonly pageCopy = new EventEmitter<NavbarPageInterface>();

  @Output()
  readonly pageDelete = new EventEmitter<NavbarPageInterface>();

  onPageSelected(page: NavbarPageInterface): void {
    this.editor.editedElement = null;
    this.pageSelect.emit(page);
  }
}
