import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { PebFieldSchema } from '@pe/builder/core';
import { PebSideBarService } from '@pe/builder/services';
import { PeDestroyService } from '@pe/common';

import { toContextFieldTree } from '../../form.utils';
import { PebContextFieldTree } from '../models';

@Component({
  selector: 'peb-field-selector',
  templateUrl: './field-selector.component.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    './field-selector.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebFieldSelectorComponent {
  selected$: Subject<PebContextFieldTree> = new Subject();
  treeItems$ = new BehaviorSubject<PebContextFieldTree[]>([]);

  @Input()
  public set schema(data: PebFieldSchema[]) {
    if (!data) {
      return;
    }
    const treeItems = data.map(field => toContextFieldTree(field));
    this.treeItems$.next(treeItems);
  };

  constructor(
    private readonly sideBarService: PebSideBarService,
  ) {
  }

  select(item?: PebContextFieldTree) {
    this.selected$.next(item);
    this.sideBarService.back();
  }
}
