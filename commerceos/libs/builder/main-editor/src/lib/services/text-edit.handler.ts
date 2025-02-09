import { Injectable } from '@angular/core';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { Observable, merge } from 'rxjs';
import {
  catchError,
  filter,
  map,
  share,
  switchMap,
  takeUntil,
  tap,
  take,
  withLatestFrom,
  distinctUntilChanged,
} from 'rxjs/operators';

import { PebSetRenderPatchModeAction, PebUpdateTextStyleAction } from '@pe/builder/actions';
import { isBlockOrInlinePosition, PebEditorPatchMode, PebScreen } from '@pe/builder/core';
import {
  canAddText,
  pointIsInsideBBox,
  removeTextAttribute,
  extractDeltaTextStyles,
  isDeltaEqual,
  extractElementTextStyles,
  bboxDimension,
  containerPaddingSpace,
} from '@pe/builder/editor-utils';
import { PebEventsService, isDblClickEvent, isClickEvent, isAnchor } from '@pe/builder/events';
import { getTextCssStyles, isReadonly, isText, PebElement } from '@pe/builder/render-utils';
import { PebViewPatchAction } from '@pe/builder/renderer';
import {
  PebDeselectAllAction,
  PebEditorState,
  PebEditTextModel,
  PebElementsState,
  PebOptionsState,
  PebPatchBBoxELementsAction,
  PebPatchEditTextAction,
  PebSetEditTextAction,
  PebUpdateAction,
} from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';


@Injectable()
export class PebTextEditHandler {
  @Select(PebOptionsState.scale) currentScale$!: Observable<number>;
  @Select(PebElementsState.selected) selectedElements$!: Observable<PebElement[]>;
  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebEditorState.editText) editText$!: Observable<PebEditTextModel>;

  defaultEditText: PebEditTextModel = {
    enabled: false,
    element: undefined,
    styles: {},
    fixedWidth: false,
    fixedHeight: false,
  }

  doubleClick$ = this.eventsService.events$.pipe(
    filter(ev => isDblClickEvent(ev)),
    takeUntil(this.destroy$),
    share(),
  );

  enableByKeystroke$ = this.eventsService.keydown$.pipe(
    withLatestFrom(this.selectedElements$, this.editText$),
    filter(([event, elements, editText]) =>
      elements?.length === 1
      && !editText.enabled
      && event.key.trim()
      && !event.metaKey
      && !event.altKey
      && !event.ctrlKey
      && event.key.length === 1
      && canAddText(elements[0])
    ),
    tap(([event, elements, editText]) => {
      const element = { ...elements[0] };
      const styles = extractElementTextStyles(element);
      element.text = { ops: [{ insert: event.key }] } as any;

      this.store.dispatch(new PebSetEditTextAction({
        ...this.defaultEditText,
        enabled: true,
        element,
        styles,
        maxWidth: this.getTextEditMaxWidth(element),
      }));

      this.store.dispatch(new PebSetRenderPatchModeAction(PebEditorPatchMode.Text));
    }),
  );

  activateTextEditor$: Observable<PebElement> = this.doubleClick$.pipe(
    filter(ev => !ev.shiftKey && !ev.metaKey),
    map(ev => ev.target as PebElement),
    withLatestFrom(this.editText$, this.screen$),
    filter(([elm, , screen]) => canAddText(elm) && !isReadonly(elm)),
    tap(([element, editText, screen]) => {
      element.id !== editText.element?.id && this.store.dispatch(new PebSetEditTextAction({
        ...this.defaultEditText,
        enabled: true,
        element,
        screen,
        maxWidth: this.getTextEditMaxWidth(element),
      }));

      this.store.dispatch(new PebSetRenderPatchModeAction(PebEditorPatchMode.Text));
    }),
    map(([element]) => element),
    takeUntil(this.destroy$),
    share(),
  );

  clickOutside$ = this.eventsService.events$.pipe(
    withLatestFrom(this.editText$),
    filter(([ev, editText]) =>
      editText.enabled
      && !isAnchor(ev.target)
      && (isDblClickEvent(ev) || isClickEvent(ev))
      && !pointIsInsideBBox({ x: ev.x, y: ev.y }, editText.element)),
    tap(() => {
      this.store.dispatch(new PebSetEditTextAction({ ...this.defaultEditText, enabled: false }));
    }),
  );

  escapeKey$ = this.editText$.pipe(
    filter(ediText => ediText.enabled && !!ediText.element),
    switchMap(() => this.eventsService.keydown$.pipe(
      filter(ev => ev.code === 'Escape'),
      tap(() => {
        this.store.dispatch([
          new PebSetEditTextAction({ ...this.defaultEditText, enabled: false }),
          new PebDeselectAllAction(),
        ]);
      }),
      take(1),
    )),
    takeUntil(this.destroy$),
  );

  selectAnotherElement$ = this.editText$.pipe(
    filter(ediText => ediText.enabled && !!ediText.element),
    switchMap(ediText => this.selectedElements$.pipe(
      filter(elements => elements[0]?.id !== ediText.element?.id),
      tap(() => {
        this.store.dispatch(new PebSetEditTextAction({ ...this.defaultEditText, enabled: false }));
      }),
      take(1),
    )),
    takeUntil(this.destroy$),
  );

  screenChanged$ = this.screen$.pipe(
    filter(screen => !!screen),
    distinctUntilChanged((scr1, scr2) => scr1.key === scr2.key),
    withLatestFrom(this.editText$),
    filter(([screen, editText]) => editText.enabled),
    tap(() => {
      this.store.dispatch([
        new PebSetEditTextAction({ ...this.defaultEditText, enabled: false }),
        new PebDeselectAllAction(),
      ]);
    }),
  )

  deactivateTextEditor$ = merge(
    this.clickOutside$,
    this.escapeKey$,
    this.selectAnotherElement$,
    this.screenChanged$,
  ).pipe(
    tap(() => this.store.dispatch(new PebSetRenderPatchModeAction(undefined)))
  );

  updateTextStyles$ = this.actions$.pipe(
    ofActionDispatched(PebUpdateTextStyleAction),
    withLatestFrom(this.editText$, this.selectedElements$),
    tap(([action, editText, selected]: [PebUpdateTextStyleAction, PebEditTextModel, PebElement[]]) => {
      if (editText.enabled) {
        return;
      }

      if (!action.submit) {
        const style = getTextCssStyles(action.payload);
        this.store.dispatch(new PebViewPatchAction(selected.map(elm => ({ id: elm.id, style }))));

        return;
      }

      const payload = selected.map((elm) => {
        let { fixedWidth = false, fixedHeight = false } = { ...elm.styles.textStyles, ...action.payload };

        const textStyles = {
          ...extractDeltaTextStyles(elm.text),
          ...action.payload,
          fixedWidth,
          fixedHeight,
        };

        if (!isText(elm)) {
          textStyles.fixedWidth = true;
          textStyles.fixedHeight = true;
        }

        const update: any = { id: elm.id, styles: { textStyles } };
        let text = removeTextAttribute(elm.text, Object.keys(textStyles));

        if (!isDeltaEqual(text, elm.text)) {
          update.text = text;
        }

        return update;
      });

      this.store.dispatch(new PebUpdateAction(payload));
    }),
  );

  handleBBoxPatch$ = this.actions$.pipe(
    ofActionDispatched(PebPatchBBoxELementsAction),
    withLatestFrom(this.editText$),
    filter(([, textEdit]) => textEdit?.enabled),
    tap(([action, textEdit]: [PebPatchBBoxELementsAction, PebEditTextModel]) => {
      const updated = action.elements.find(elm => elm.id === textEdit.element.id);
      if (updated) {
        this.store.dispatch(new PebPatchEditTextAction({ element: updated }));
      }
    })
  );

  constructor(
    private readonly actions$: Actions,
    private readonly eventsService: PebEventsService,
    private readonly store: Store,
    private readonly destroy$: PeDestroyService,
  ) {
    merge(
      this.activateTextEditor$,
      this.deactivateTextEditor$,
      this.updateTextStyles$,
      this.enableByKeystroke$,
      this.handleBBoxPatch$,
    ).pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      })
    ).subscribe();
  }

  getResizedViewElement$(elementId: string): Observable<{ id: string; width: number; height: number }> {
    return this.actions$.pipe(
      ofActionDispatched(PebPatchEditTextAction),
      filter((action: PebPatchEditTextAction) => action.payload.viewElement?.id === elementId),
      take(1),
      map((action: PebPatchEditTextAction) => action.payload.viewElement),
      takeUntil(this.destroy$),
    );
  }

  getTextEditMaxWidth(element: PebElement): number {
    if (isBlockOrInlinePosition(element.styles.position)) {
      return bboxDimension(containerPaddingSpace(element)).width;
    }

    return element.screen ? element.screen.width + element.screen.padding * 2 : 0;
  }
}
