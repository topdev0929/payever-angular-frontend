import { Component, ChangeDetectionStrategy, Optional, Inject, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';

import { PeDestroyService } from '@pe/common';

import { PE_CONTEXTMENU_DATA, PE_CONTEXTMENU_THEME } from './constants';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'peb-context-menu',
  templateUrl: './context-menu.html',
  styleUrls: ['./context-menu.scss'],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PebContextMenuComponent {
  select$ = new Subject();

  constructor(
    @Optional() @Inject(PE_CONTEXTMENU_THEME) public theme: string,
    @Optional() @Inject(PE_CONTEXTMENU_DATA) public data: any,
    public readonly destroy$: PeDestroyService,
  ) {
  }

  onSelect(value: string) {
    this.select$.next(value);
  }

  onClose() {
    this.select$.next();
  }

}
