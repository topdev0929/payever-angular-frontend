import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import Delta from 'quill-delta';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  pairwise,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { PebUpdateTextStyleAction } from '@pe/builder/actions';
import {
  PebCss,
  PebDefaultTextStyles,
  PebElementStyles,
  PebOverflowMode,
  PebTextStyles,
  PEB_MIN_TEXT_HEIGHT,
  PEB_MIN_TEXT_WIDTH,
  isPixelSize,
  isBlockPosition,
} from '@pe/builder/core';
import {
  bboxDimension,
  extractDeltaTextStyles,
  extractElementTextStyles,
  findTotalArea,
  isAutoHeightText,
  isAutoWidthText,
  isDeltaEmpty,
  removeTextAttribute,
} from '@pe/builder/editor-utils';
import { PebEventsService } from '@pe/builder/events';
import {
  getPebSize,
  isShape,
  isText,
  PebElement,
  getTextCssStyles,
  isFlexibleHeightElement,
  getPaddingCssStyles,
} from '@pe/builder/render-utils';
import {
  PebEditorState,
  PebEditTextModel,
  PebElementsState,
  PebOptionsState,
  PebPatchEditTextAction,
  PebSyncAction,
  PebUpdateAction,
  PebUpdateElementDefAction,
} from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { PebUpdateViewBBoxAction, PebViewPatchAction } from '../renderer.actions';

import { default as Quill } from './quill';


@Component({
  selector: 'peb-text-editor',
  template: `
    <div #quill class="ql-container peb-text-editor"
      [ngClass]="editorClasses$|async"
      [ngStyle]="editorStyles$|async"
    ></div>
  `,
  styles: [
    `
      .peb-text-editor {
        pointer-events: auto;
        height: auto;
        white-space: normal;
        max-width: 100%;

        .ql-editor {
          width: auto;
          white-space: normal;
          min-height: 100%;
        }

        p {
          padding: 0;
          margin: 0;
        }
      }

      .peb-text-editor.auto-height {
          height: auto;
      }

      .peb-text-editor.auto-width {
        width:auto;

        .ql-editor{
          white-space: normal;
        }
    }

      .peb-text-editor.vertical-top .ql-editor    {justify-content: flex-start;}
      .peb-text-editor.vertical-center .ql-editor {justify-content: center;}
      .peb-text-editor.vertical-bottom .ql-editor {justify-content: flex-end;}
    `,
  ],
  /** For Quill editor styles, make sure `./quill.scss` is added to app global styles in workspace.json */
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebTextEditorComponent implements AfterViewInit, OnChanges {
  @ViewChild('quill') quillContainer: ElementRef;

  @Select(PebEditorState.editText) editText$!: Observable<PebEditTextModel>;

  private quill: typeof Quill;
  private isDirty = false;

  textStyles$ = new BehaviorSubject<Partial<PebTextStyles>>({});

  editorClasses$ = new BehaviorSubject<string[]>([]);
  editorStyles$ = new BehaviorSubject<PebCss>({});

  updateEditorStyles$ = this.editText$.pipe(
    map((editText) => {
      if (!editText.enabled || !editText.element) {
        return {
          left: '0px',
          top: '0px',
          width: '0px',
          height: '0px',
          overflow: 'hidden',
        };
      }

      const css = {
        ...getTextCssStyles({ ...this.textStyles$.value, ...editText.styles }),
        ...getPaddingCssStyles(editText.element.styles),
        left: `${editText.element.minX}px`,
        top: `${editText.element.minY}px`,
        maxWidth: editText.maxWidth ? `${editText.maxWidth}px` : 'auto',
      };

      const { width, height } = bboxDimension(editText.element);
      editText.fixedWidth && (css.width = `${width}px`);
      editText.fixedHeight && (css.height = `${height}px`);

      if (isAutoWidthText(editText.element) && isBlockPosition(editText.element.styles?.position)) {
        css.width = `${editText.maxWidth}px`;
      }

      return css;
    }),
    tap(css => this.editorStyles$.next(css)),
  );

  initQuill$ = this.eventsService.contentElement$.pipe(
    filter(iframe => !!iframe.contentDocument?.body),
    take(1),
    map((iframe) => {
      return this.quill = initQuill(this.quillContainer.nativeElement, iframe.contentDocument);
    }),
    switchMap((quill) => {
      return fromEvent(quill, 'text-change').pipe(
        tap(() => {
          this.handleTextChange();
        }),
      );
    })
  );

  activateTextEditor$ = this.editText$.pipe(
    distinctUntilChanged((a, b) => a.enabled === b.enabled && a.element?.id === b.element?.id),
    filter(textEdit => textEdit.enabled),
    tap((textEdit) => {
      this.loadTextEdit(textEdit);
    }),
  );

  deactivateTextEdit$ = this.editText$.pipe(
    pairwise(),
    filter(([first, second]) => first.enabled && !second.enabled),
    map(value => value.find(val => val.enabled)),
    tap((textEdit) => {
      this.isDirty && this.commitTextEdit(textEdit);
      this.isDirty = false;
      this.quill.setContents({}, 'silent');
    }),
  );

  updateTextStyles$ = this.actions$.pipe(
    ofActionDispatched(PebUpdateTextStyleAction),
    withLatestFrom(this.editText$),
    tap(([action, editText]: [PebUpdateTextStyleAction, PebEditTextModel]) => {
      if (!editText.enabled) {
        return;
      }

      this.isDirty = true;
      this.textStyles$.next({ ...this.textStyles$.value, ...action.payload });
      const styles = { ...editText.styles, ...action.payload };
      this.store.dispatch(new PebPatchEditTextAction({ styles }));
      this.handleEditorClasses({ ...editText, styles });
      setTimeout(() => this.handleAutoSize(editText), 0);
    }),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly destroy$: PeDestroyService,
    private readonly eventsService: PebEventsService,
    private readonly store: Store,
  ) {
  }

  ngAfterViewInit(): void {
    merge(
      this.initQuill$,
      this.activateTextEditor$,
      this.deactivateTextEdit$,
      this.updateTextStyles$,
      this.updateEditorStyles$,
    ).pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      })
    ).subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.quill && changes.text) {
      const text = changes.text.currentValue;
      const range = this.quill.getSelection();
      this.quill.setContents(text, 'silent');
      this.quill.setSelection(range, 'silent');
    }
  }

  loadTextEdit(textEdit: PebEditTextModel) {
    const screen = this.store.selectSnapshot(PebOptionsState.screen);
    const element = textEdit.element;
    let text: Delta = this.getText(textEdit.element);
    const elementStyles = extractElementTextStyles(element);
    const styles = { ...textEdit.styles, ...elementStyles };
    removeTextAttribute(text, Object.keys(elementStyles));

    const editUpdate: PebEditTextModel = {
      ...textEdit,
      screen,
      styles,
      fixedWidth: !isAutoWidthText(element),
      fixedHeight: !isAutoHeightText(element),
    };

    this.isDirty = false;
    this.quill.setContents(text, 'silent');
    this.textStyles$.next({ ...PebDefaultTextStyles, ...editUpdate.styles });
    this.handleEditorClasses(editUpdate);

    setTimeout(() => {
      const [start, length] = [0, this.quill.getLength()];
      this.quill.setSelection(start, length);
      this.handleAutoSize(editUpdate);
    }, 0);

    this.store.dispatch(new PebPatchEditTextAction(editUpdate));
  }

  commitTextEdit(textEdit: PebEditTextModel) {
    const text: Delta = this.quill.getContents();
    const screen = this.store.selectSnapshot(PebOptionsState.screen);

    const update = {
      id: textEdit.element.id,
      text,
      styles: { textStyles: { ...textEdit.styles } } as Partial<PebElementStyles>,
    };

    const { element } = textEdit;
    isText(element) && (update.styles.textStyles.fixedWidth = !isAutoWidthText(element));

    const autoSize = !textEdit.fixedWidth || !textEdit.fixedHeight;
    if (autoSize) {

      const dim = this.getTextDimension();
      const width = Math.max(dim.width + 1, PEB_MIN_TEXT_WIDTH);
      const height = Math.max(dim.height, PEB_MIN_TEXT_HEIGHT);
      update.styles.dimension = {
        width: isPixelSize(element.styles.dimension.width) ? getPebSize(width) : element.styles.dimension.width,
        height: isPixelSize(element.styles.dimension.height) ? getPebSize(height) : element.styles.dimension.height,
      };

      !isPixelSize(element.styles.dimension.width) && delete update.styles.dimension.width;
      !isPixelSize(element.styles.dimension.height) && delete update.styles.dimension.height;

      if (textEdit.screen && screen.key !== textEdit.screen?.key) {
        this.store.dispatch(new PebUpdateElementDefAction([{
          id: update.id,
          styles: { [textEdit.screen.key]: update.styles },
        }]));
      }
    } else if (isShape(textEdit.element)) {
      update.styles.overflow = PebOverflowMode.Hidden;
    }

    this.store.dispatch(new PebUpdateAction([update])).pipe(
      tap(() => {
        const models = this.store.selectSnapshot(PebElementsState.visibleElements);
        const updatedElement = models.find(elm => elm.id === textEdit.element.id);
        this.store.dispatch(new PebSyncAction([updatedElement], { textStyles: true }));
      }),
      take(1),
    ).subscribe();
  }

  handleTextChange() {
    this.isDirty = true;
    const editText = this.store.selectSnapshot(PebEditorState.editText);

    this.handleAutoSize(editText);

    if (isDeltaEmpty(this.quill.getContents())) {
      const styles = extractDeltaTextStyles(editText.element.text);
      this.store.dispatch(new PebPatchEditTextAction({ styles }));
    }
  }

  handleAutoSize(textEdit: PebEditTextModel) {
    if (!textEdit.enabled || textEdit.fixedWidth && textEdit.fixedHeight) {
      return;
    }

    const { width, height } = this.getTextDimension();
    width !== bboxDimension(textEdit.element).width && (this.isDirty = true);

    this.store.dispatch(new PebViewPatchAction([{
      id: textEdit.element.id,
      style: { width: `${width}px`, height: `${height}px` },
    }]));

    this.store.dispatch(new PebUpdateViewBBoxAction({ [textEdit.element.id]: { width, height } }));

    this.handleParentAutoHeight(textEdit.element, height);
  }

  handleParentAutoHeight(element: PebElement, height: number) {
    let excludeId = element.id;
    let parent = element.parent;
    let maxY = element.minY + height;

    const payload = [];

    while (parent && isFlexibleHeightElement(parent)) {
      maxY = Math.max(maxY, findTotalArea([...parent.children].filter(ch => ch.id !== excludeId)).maxY);
      const height = maxY - parent.minY;
      payload.push({
        id: parent.id,
        style: { height: `${height}px` },
      });
      excludeId = parent.id;

      parent = parent.parent;
    }

    payload.length && this.store.dispatch(new PebViewPatchAction(payload));
  }

  handleEditorClasses(textEdit: PebEditTextModel) {
    const cls = [];

    if (!textEdit.styles) {
      return cls;
    }

    !textEdit.fixedWidth && cls.push('auto-width');
    !textEdit.fixedHeight && cls.push('auto-height');

    cls.push(`vertical-${textEdit.styles.verticalAlign}`);

    this.editorClasses$.next(cls);
  }

  getText(element: PebElement): Delta {
    return element.text;
  }

  getTextDimension(): { width: number; height: number } {
    const width = this.quillContainer.nativeElement.clientWidth;
    const height = this.quillContainer.nativeElement.clientHeight;

    return { width, height };
  }
}

export const initQuill = (container: HTMLElement, doc: Document): typeof Quill => {
  const quill = new Quill(
    container,
    doc,
    {
      readOnly: false,
      /**
       * Fix selection jumping
       * @link https://github.com/quilljs/quill/blob/5b28603337f3a7a2b651f94cffc9754b61eaeec7/core/quill.js#L171
       */
      scrollingContainer: doc.body,
      formats: ['color', 'italic', 'link', 'strike', 'underline', 'align'],
      modules: {
        keyboard: {
          bindings: {
            /** Disable lists autoformatting, TODO: remove after lists support added in UI */
            'list autofill': {
              key: ' ',
              shiftKey: null,
              collapsed: true,
              handler: () => {
                return true;
              },
            },
            bold: {
              key: 'b',
              shortKey: true,
              handler: () => {
                const format = quill.getFormat();
                const fontWeight = Array.isArray(format.fontWeight) ? format.fontWeight[0] : format.fontWeight;
                quill.format('fontWeight', fontWeight >= 700 ? 400 : 700);
              },
            },
          },
        },
      },
    },
  );

  const inlineTags = ['LI', 'UL', 'OL', 'SPAN'];

  quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node) => {
    const deltaPath = 'delta';
    const delta = Quill.import(deltaPath);
    const selection = quill.getSelection();

    let text = node.innerText;
    !inlineTags.includes(node.nodeName) && (text += '\n');

    return new delta().insert(text, quill.getFormat(selection.index, 0));
  });

  return quill;
};
