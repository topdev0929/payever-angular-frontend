import { Component } from '@angular/core';

import { PeDestroyService } from '@pe/common';


@Component({
  selector: 'peb-editor-page-sidebar',
  templateUrl: 'page.sidebar.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './page.sidebar.scss',
  ],
  providers: [
    PeDestroyService,
  ],
})
export class PebEditorPageSidebarComponent {
}
