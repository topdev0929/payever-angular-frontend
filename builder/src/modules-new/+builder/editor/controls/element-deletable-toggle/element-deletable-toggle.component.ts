import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, debounceTime, switchMap } from 'rxjs/operators';

import { PebElement, PebPageStore } from '@pe/builder-core';
import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';

@Component({
  selector: 'pe-builder-element-deletable-toggle',
  templateUrl: './element-deletable-toggle.component.html',
  styleUrls: ['./element-deletable-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ElementDeletableToggleComponent implements OnInit {
  @Input() editor: EditorState;
  @Input() pageStore: PebPageStore;
  @Output() readonly changed = new EventEmitter<any>();

  checked$: Observable<boolean>;

  ngOnInit(): void {
    this.checked$ = this.pageStore.state$.pipe(
      debounceTime(100),
      switchMap(() => this.editor.activeElement$),
      map(id => this.pageStore.findElement(id)),
      filter((e: PebElement) => !!e && !!e.meta),
      map((element: PebElement) => element.meta.deletable === false),
    );
  }

  onChanged(value: boolean): void {
    this.pageStore.updateElement(this.editor.activeElement, {
      meta: {
        deletable: !value,
      },
    });
  }
}
