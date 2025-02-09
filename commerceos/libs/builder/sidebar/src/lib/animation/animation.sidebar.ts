import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-editor-animation-sidebar',
  templateUrl: 'animation.sidebar.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './animation.sidebar.scss',
  ],
  providers: [
    PeDestroyService,
  ],
})
export class PebEditorAnimationSidebarComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
