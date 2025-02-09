import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { merge, Observable, Subject } from 'rxjs';
import { filter, map, mapTo, scan, tap, withLatestFrom } from 'rxjs/operators';

import { PebGroupAction, PebUngroupAction } from '@pe/builder/actions';
import { PebEditorPoint, PebElementType, PebScreen } from '@pe/builder/core';
import { findElementSection } from '@pe/builder/editor-utils';
import { PebEventsService, PebEventType, PebMouseEventButton } from '@pe/builder/events';
import { isReadonly, isSection, PebElement } from '@pe/builder/render-utils';
import {
  PebBringFrontAction,
  PebClearStylesAction,
  PebClipboardState,
  PebCopyElementsAction,
  PebElementsState,
  PebOptionsState,
  PebPasteElementsAction,
  PebSendBackAction,
} from '@pe/builder/state';

import { getGroupId, PebContextMenuCommands, PebContextMenuState } from './context-menu';


@Injectable({ providedIn: 'any' })
export class PebEditorContextMenuService {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;
  @Select(PebOptionsState.screen) private readonly screen$!: Observable<PebScreen>;
  @Select(PebElementsState.openGroup) openGroup$!: Observable<string>;

  private pointerPosition?: PebEditorPoint;

  constructor(
    private readonly store: Store,
    private readonly eventService: PebEventsService,
  ) {
    this.eventService.events$.pipe(
      filter(event => event.type === PebEventType.mousedown && event.button === PebMouseEventButton.Right),
      withLatestFrom(this.selectedElements$, this.screen$),
      tap(([event, [selected], screen]) => {
        const section = findElementSection(selected);
        this.pointerPosition = { x: event.x - screen.padding, y: event.y - section.minY };
      }),
    ).subscribe();
  }

  private selected$ = this.selectedElements$;

  private readonly cmd$ = new Subject<PebContextMenuCommands>();

  private readonly commandsHandler$ = this.cmd$.pipe(
    withLatestFrom(this.selected$, this.openGroup$),
  );

  private copy$ = this.commandsHandler$.pipe(
    filter(([cmd]) => cmd === PebContextMenuCommands.Copy),
    tap(() => this.store.dispatch(new PebCopyElementsAction())),
  );

  private paste$ = this.commandsHandler$.pipe(
    filter(([cmd]) => cmd === PebContextMenuCommands.Paste),
    tap(() => this.store.dispatch(new PebPasteElementsAction(this.pointerPosition))),
  );

  private group$ = this.commandsHandler$.pipe(
    filter(([cmd, elements, openGroup]) =>
      cmd === PebContextMenuCommands.Group && this.canGroup(elements, openGroup),
    ),
    tap(() => {
      this.store.dispatch(new PebGroupAction());
    }),
    mapTo({ canGroup: false, canUngroup: true }),
  );

  private ungroup$ = this.commandsHandler$.pipe(
    filter(([cmd, elements, openGroup]) =>
      cmd === PebContextMenuCommands.Ungroup && this.canUngroup(elements, openGroup),
    ),
    tap(() => {
      this.store.dispatch(new PebUngroupAction());
    }),
    mapTo({ canGroup: true, canUngroup: false }),
  );

  private bringFront$ = this.commandsHandler$.pipe(
    filter(([cmd]) => cmd === PebContextMenuCommands.BringFront),
    tap(() => this.store.dispatch(new PebBringFrontAction())),
  );

  private sendBack$ = this.commandsHandler$.pipe(
    filter(([cmd]) => cmd === PebContextMenuCommands.SendBack),
    tap(() => this.store.dispatch(new PebSendBackAction())),
  );

  clearStyles$ = this.commandsHandler$.pipe(
    filter(([cmd]) => cmd === PebContextMenuCommands.ClearStyles),
    tap(() => this.store.dispatch(new PebClearStylesAction())),
  );

  private menuState: PebContextMenuState = {
    canGroup: false,
    canUngroup: false,
    canDelete: false,
    addSection: true,
    canSave: true,
    canCopy: true,
    canPaste: false,
    canClearStyles: false,
    canBringFront: true,
    canSendBack: true,
  }

  selectionState$ = this.selected$.pipe(
    withLatestFrom(this.openGroup$),
    map(([elements, openGroup]) => {

      return {
        ...this.menuState,
        canGroup: this.canGroup(elements, openGroup),
        canUngroup: this.canUngroup(elements, openGroup),
        canDelete: this.canDelete(elements),
        canSave: true,
        canCopy: this.canCopy(),
        canPaste: this.canPaste(elements),
        addSection: true,
        canBringFront: !this.hasSection(),
        canSendBack: !this.hasSection(),
        canClearStyles: this.canClearStyle(elements),
      };
    }),
  );

  menuState$ = merge(
    this.selectionState$,
    this.group$,
    this.ungroup$,
    this.copy$,
    this.paste$,
    this.bringFront$,
    this.sendBack$,
    this.clearStyles$,
  ).pipe(
    scan<PebContextMenuState>((acc, value) => ({ ...acc, ...value }), this.menuState),
  );

  /**
   * All top level selected elements should be within same container,
   * should not be all in the same group (already grouped) and should not include Sections, Document and grid cells
   */
  private canGroup(elements: PebElement[], openGroup: string) {
    const topLevelElements = elements.filter(elm => !elements.some(e => e === elm.parent));
    const containers = topLevelElements.reduce((acc, elm) => {
      acc.add(elm.parent?.id);

      return acc;
    }, new Set<string>());

    const groups = [...new Set(elements.map(elm => getGroupId(elm, openGroup)))];
    const isAlreadyGrouped = groups.length === 1 && !groups.includes(undefined);

    return elements.length > 1
      && containers.size === 1
      && !isAlreadyGrouped
      && elements.every(element => ![PebElementType.Document, PebElementType.Section].includes(element.type));
  }

  private canUngroup(elements: PebElement[], openGroup: string) {
    const groups = new Set<string>();
    elements.forEach((elm) => {
      const groupId = getGroupId(elm, openGroup);
      if (groupId) {
        groups.add(groupId);
      }
    });

    return groups.size === 1;
  }

  canDelete(elements) {
    return elements.length > 0
      && elements.every(element => ![PebElementType.Document].includes(element.type))
      && elements.every(elm => !isReadonly(elm));
  }

  canClearStyle(elements) {
    return this.canDelete(elements);
  }

  dispatch(value: PebContextMenuCommands) {
    this.cmd$.next(value);
  }

  private canCopy(): boolean {
    const selected = this.store.selectSnapshot(PebElementsState.selectedElements);

    return selected?.length > 0;
  }

  private canPaste(elements): boolean {
    if (elements.some(isReadonly)) {
      return false;
    }

    const clipboard = this.store.selectSnapshot(PebClipboardState.elements);

    return clipboard?.length > 0;
  }

  private hasSection(): boolean {
    return this.store.selectSnapshot(PebElementsState.selectedElements).some(isSection);
  }
}
