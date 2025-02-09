import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { PebElement, PebPageStore } from '@pe/builder-core';
import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';

@Component({
  selector: 'pe-builder-element-link-home-toggle',
  templateUrl: './element-link-home-toggle.component.html',
  styleUrls: ['./element-link-home-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ElementLinkHomeToggleComponent implements OnInit {
  @Input() editor: EditorState;
  @Input() pageStore: PebPageStore;
  @Output() readonly changed = new EventEmitter<any>();

  checked$: Observable<boolean>;

  ngOnInit(): void {
    this.checked$ = combineLatest([this.editor.activeElement$, this.pageStore.state$]).pipe(
      map(([id, state]: [string, any]) => this.pageStore.findElement(id)),
      filter((e: PebElement) => !!e && !!e.data),
      map((element: PebElement) => element.data.linkHome),
    );
  }

  onChanged(linkHome: boolean): void {
    this.pageStore.updateElement(this.editor.activeElement, {
      data: {
        linkHome,
      },
    });
  }
}
