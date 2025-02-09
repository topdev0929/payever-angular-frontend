import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { PebElement, PebPageStore } from '@pe/builder-core';
import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';

@Component({
  selector: 'pe-builder-element-pinned-toggle',
  templateUrl: './element-pinned-toggle.component.html',
  styleUrls: ['./element-pinned-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ElementPinnedToggleComponent implements OnInit {
  @Input() editor: EditorState;
  @Input() pageStore: PebPageStore;
  @Output() readonly changed = new EventEmitter<any>();

  checked$: Observable<boolean>;

  ngOnInit(): void {
    this.checked$ = combineLatest([this.editor.activeElement$, this.pageStore.state$]).pipe(
      map(([id, state]: [string, any]) => this.pageStore.findElement(id)),
      filter((e: PebElement) => !!e && !!e.meta),
      map((element: PebElement) => element.meta.pinned),
    );
  }

  onChanged(pinned: boolean): void {
    this.pageStore.updateElement(this.editor.activeElement, {
      meta: {
        pinned,
      },
    });
  }
}
