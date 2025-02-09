import { Injectable, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import Delta from 'quill-delta';
import { combineLatest, merge, Observable, Subject } from 'rxjs';
import { filter, map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

import { PebTextSelectionChangedAction, PebUpdateTextStyleAction } from '@pe/builder/actions';
import {
  PebDefaultTextStyles,
  PebElementStyles,
  PebElementType,
  PebInteractionWithPayload,
  PebTextVerticalAlign,
} from '@pe/builder/core';
import { PebQuillRenderer } from '@pe/builder/delta-renderer';
import { isDeltaEmpty } from '@pe/builder/editor-utils';
import { textAlignToJustifyContent, PebElement } from '@pe/builder/render-utils';
import { PebViewPatchAction } from '@pe/builder/renderer';
import { PebEditorState, PebEditTextModel, PebElementsState, PebUpdateAction } from '@pe/builder/state';

import { getTextStyle, hasLinks } from './text';


@Injectable({ providedIn: 'any' })
export class PebQuillService implements OnDestroy {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;
  @Select(PebEditorState.editText) private readonly editText$!: Observable<PebEditTextModel>;

  private readonly destroy$ = new Subject<void>();

  private readonly activeTextEditor$ = this.editText$.pipe(
    switchMap(() => this.selectedElements$.pipe(
      take(1),
      filter(elm => !!elm),
    )),
  );

  private readonly fromElements$ = this.selectedElements$.pipe(
    map((selected) => {
      const links = new Set<PebInteractionWithPayload>();
      const verticalAlignment = new Set<PebTextVerticalAlign>();
      const text = selected.reduce((acc, elm) => {

        if (elm.text && [PebElementType.Text, PebElementType.Shape].includes(elm.type)) {
          if (elm.data?.linkInteraction && !hasLinks(elm.text)) {
            links.add(elm.data?.linkInteraction);
          }
          verticalAlignment.add(elm.styles.textStyles?.verticalAlign ?? PebTextVerticalAlign.Top);
          acc.push(elm.text);
        }

        if (elm.type === PebElementType.Grid) {
          acc.push(...[...elm.children].reduce((children, e) => {
            if (e.text) {
              children.push(e.text);
            }
            verticalAlignment.add(e.styles.textStyles?.verticalAlign ?? PebTextVerticalAlign.Top);

            return children;
          }, []));
        }

        return acc;
      }, [] as Delta[]);

      const format = getTextStyle(text) as any;
      if (links.size) {
        let link: any[];
        if (!format.link) {
          link = [];
        }
        if (Array.isArray(format.link)) {
          link = format.link;
        } else {
          link = [format.link];
        }
        const formatLink = link.concat([...links]);
        format.link = formatLink.length === 1 ? formatLink[0] : formatLink;
      }

      if (verticalAlignment.size > 0) {
        format.verticalAlign = verticalAlignment.size > 1 ? [...verticalAlignment] : [...verticalAlignment][0];
      }

      console.log('fromElements:', format);

      return format;
    }),
  );

  private readonly textSelectionChanged$ = this.actions$.pipe(
    ofActionDispatched(PebTextSelectionChangedAction),
    map(({ payload }) => payload),
  );

  private readonly range$ = this.textSelectionChanged$.pipe(
    map(([, range]) => range),
  );

  private readonly fromRange$ = this.textSelectionChanged$.pipe(
    map(([delta]) => getTextStyle([delta] as Delta[])),
    withLatestFrom(this.selectedElements$),
    map(([styles, selected]) => {
      const verticalAlign = selected[0].styles.textStyles?.verticalAlign;

      return verticalAlign ? { ...styles, verticalAlign } : styles;
    }),
  );

  textStyle$ = merge(
    this.fromElements$,
    this.fromRange$,
  ).pipe(
    map(styles => ({ ...PebDefaultTextStyles, ...styles })),
  );

  elementsToUpdate$ = merge(
    combineLatest([this.activeTextEditor$, this.range$]).pipe(map(value => [[...value, true]])),
    this.selectedElements$.pipe(
      map((elements) => {
        const validElements = elements.reduce((acc, elm) => {
          if ([PebElementType.Shape, PebElementType.Text].includes(elm.type)) {
            acc.push(elm);
          }

          return acc;
        }, []);

        return validElements.map(elm => [elm, { index: 0, length: elm.text?.length() ?? 0 }, false]);
      }),
    ),
  );

  setTextStyle$ = this.actions$.pipe(
    ofActionDispatched(PebUpdateTextStyleAction),
    withLatestFrom(this.elementsToUpdate$),
    tap(([value, elements]) => {

      console.log('setTextStyle$', { value, elements });


      const normalizeDelta = (delta: Delta) => {
        const ops = delta.ops.reduce((acc, op, i) => {
          if (typeof op.insert === 'string') {
            if (i === 0 && op.insert === '\n') {
              acc.push({ insert: '' });
            }
            const { align, ...attributes } = op.attributes ?? {};
            delete attributes.verticalAlign;

            Object.entries(attributes).forEach(([key, value]) => {
              if (value === PebDefaultTextStyles[key]) {
                delete attributes[key];
              }
            });

            const tokens = tokenize(op.insert);
            tokens.forEach((token) => {
              if (token === '\n') {
                align ? acc.push({ insert: token, attributes: { align } }) : acc.push({ insert: token });
              } else {
                Object.keys(attributes).length
                  ? acc.push({ insert: token, attributes })
                  : acc.push({ insert: token });
              }
            });
          }

          return acc;
        }, []);

        if (ops[ops.length - 1].insert !== '\n') {
          ops.push({ insert: '\n' });
        }

        return new Delta(ops);
      };

      const { payload, submit } = value;
      const viewActions = [];
      const updateActions = [];
      elements.forEach(([elm, range, editMode]) => {
        if (payload.verticalAlign) {
          viewActions.push({
            id: elm.id,
            style: {
              justifyContent: textAlignToJustifyContent(payload.verticalAlign),
            },
          });

          if (submit) {
            updateActions.push({
              id: elm.id,
              styles: {
                verticalAlign: payload.verticalAlign !== PebTextVerticalAlign.Top ? payload.verticalAlign : null,
              },
            });
          }
        } else {
          let elmText: Delta;
          if (elm.text) {
            elmText = normalizeDelta(elm.text);
          } else {
            const ops = payload.textJustify
              ? [{ insert: '' }, { insert: '\n', attributes: { align: payload.textJustify } }]
              : [{ insert: '', attributes: payload }, { insert: '\n' }];
            elmText = new Delta(ops);
          }
          let text: Delta;
          const styles: Partial<PebElementStyles> = {};
          if (payload.textJustify) {
            let length = 0;
            let line = 0;
            text = new Delta(elmText.map((value) => {
              const op = { ...value };
              const d = new Delta([op]);

              line += d.length();

              if (typeof op.insert === 'string' && op.insert.indexOf('\n') !== -1) {
                if (length <= range.index + range.length && length + line >= range.index) {
                  op.attributes = { ...op.attributes, align: payload.textJustify };
                }

                length += line;
                line = 0;
              }

              return op;
            }));
          } else if (payload.link) {

            if (payload.link.type === null) {
              /** remove any links */
              const changes = new Delta().retain(range.index).retain(range.length, { link: null });
              text = new Delta(elmText).compose(changes);

              viewActions.push({
                id: elm.id,
                data: { linkInteraction: null },
              });

              if (submit) {
                updateActions.push({ id: elm.id, data: { linkInteraction: null } });
              }
            } else if (editMode) {
              /** in the text edit mode set links to selection and remove linkInteraction */
              const changes = new Delta().retain(range.index).retain(range.length, payload);
              text = new Delta(elmText).compose(changes);

              viewActions.push({
                id: elm.id,
                data: { linkInteraction: null },
              });

              if (submit) {
                updateActions.push({ id: elm.id, data: { linkInteraction: null } });
              }
            } else {
              /** if not in the edit mode set linkInteraction and remove any links from text */
              const changes = new Delta().retain(range.index).retain(range.length, { link: null });
              text = new Delta(elmText).compose(changes);

              viewActions.push({
                id: elm.id,
                data: { linkInteraction: payload.link },
              });

              if (submit) {
                updateActions.push({ id: elm.id, data: { linkInteraction: payload.link } });
              }
            }
          } else {
            if (elmText.ops.length === 2 && !elmText.ops[0].insert) {
              elmText.ops[0].attributes = { ...elmText.ops[0].attributes, ...payload };
              text = elmText;
            } else {
              const changes = new Delta().retain(range.index).retain(range.length, payload);
              text = new Delta(elmText).compose(changes);
            }

            if (payload.fontSize) {
              styles.fontSize = payload.fontSize;
            }
          }

          viewActions.push({
            id: elm.id,
            textHTML: isDeltaEmpty(text)
              ? undefined
              : this.domSanitizer.bypassSecurityTrustHtml(PebQuillRenderer.render(text)),
            text,
            styles,
          });

          if (submit) {
            updateActions.push({ id: elm.id, text, styles });
          }
        }
      });

      if (viewActions.length) {
        this.store.dispatch(new PebViewPatchAction(viewActions));
      }

      if (updateActions.length) {
        this.store.dispatch(new PebUpdateAction(updateActions));
      }
    }),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
    private readonly domSanitizer: DomSanitizer,
  ) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}


/**
 *  Splits by new line character ("\n") by putting new line characters into the
 *  array as well. Ex: "hello\n\nworld\n " => ["hello", "\n", "\n", "world", "\n", " "]
 */
export const tokenize = (str: string): string[] => {
  const newLine = '\n';

  if (str === newLine) {
    return [str];
  }

  const lines = str.split(newLine);

  if (lines.length === 1) {
    return lines;
  }

  const lastIndex = lines.length - 1;

  return lines.reduce((acc: string[], line: string, index: number) => {
    if (line !== '') {
      acc.push(line);
    }

    if (index !== lastIndex) {
      acc.push(newLine);
    }

    return acc;
  }, []);
};
