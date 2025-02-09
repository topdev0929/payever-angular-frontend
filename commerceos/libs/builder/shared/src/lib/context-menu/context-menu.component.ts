import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PebScreen } from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';
import { PebElementsState, PebOptionsState } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { PebContextMenuCommands, PebContextMenuState } from './context-menu';
import { PebEditorContextMenuService } from './context-menu.service';


@Component({
  selector: 'peb-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class EditorContextMenuComponent {

  @Select(PebOptionsState.screen) screen$: Observable<PebScreen>;
  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;
  @Select(PebElementsState.openGroup) openGroup!: Observable<string>;

  screen: PebScreen;
  elements: PebElement[];

  menu$: Observable<PebContextMenuState> = this.contextMenuService.menuState$;
  commands = PebContextMenuCommands;

  @Output() event = new EventEmitter<string>();

  constructor(
    private readonly destroy$: PeDestroyService,
    private readonly contextMenuService: PebEditorContextMenuService,
  ) {
    this.screen$.pipe(
      tap((screen) => {
        this.screen = screen;
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.selectedElements$.pipe(
      tap((elements) => {
        this.elements = elements;
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  saveShape(): void {
    this.event.emit('save');
  }

  execCommand(value: PebContextMenuCommands) {
    this.contextMenuService.dispatch(value);
    this.event.emit('close');
  }

  delete(): void {
    this.event.emit('delete');
  }

  addSection(): void {
    this.event.emit('addSection');
  }
}
