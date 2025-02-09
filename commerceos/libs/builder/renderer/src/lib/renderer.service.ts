import { Injectable, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import produce, { Draft } from 'immer';
import { isEqual } from 'lodash';
import Delta from 'quill-delta';
import { Observable, Subject, merge } from 'rxjs';
import { catchError, map, scan, shareReplay } from 'rxjs/operators';

import {
  PebViewStyle,
  PebViewElement,
  PebScreen,
  PebViewVector,
  PebElementType,
  PebLanguage,
  PebIntegrationDataType,
  evaluate,
} from '@pe/builder/core';
import { PebQuillRenderer } from '@pe/builder/delta-renderer';
import {
  isDeltaEmpty,
  splitStyles,
  editorElementStyles,
  removeTextAttribute,
} from '@pe/builder/editor-utils';
import {
  getVectorPatchElementStyles,
  getVectorStyles,
  viewElementStyles,
  PebElement,
  getNormalizedKey,
  isVector,
} from '@pe/builder/render-utils';
import { PebElementsState, PebOptionsState } from '@pe/builder/state';
import { PebViewState } from '@pe/builder/view-state';

import {
  PebViewDeleteAction,
  PebViewPatchAction,
  PebViewSetAction,
  PebViewUpdateAction,
} from './renderer.actions';
import { renderElementContext } from './tools';


@Injectable({ providedIn: 'any' })
export class PebRendererService implements OnDestroy {
  @Select(PebOptionsState.language) language$!: Observable<PebLanguage>;
  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebElementsState.visibleElements) pebElements$!: Observable<PebElement[]>;

  private readonly destroy$ = new Subject<void>();

  private get viewSetAction() {
    return (action: PebViewUpdateAction) => (acc: DraftModel) => {
      const elements = action.payload;

      this.deleteMissingElements(acc, []);
      this.addOrUpdateChanges(acc, elements);
    };
  }

  private get viewUpdateAction() {
    return (action: PebViewUpdateAction) => (acc: DraftModel) => {
      const elements = action.payload;

      this.deleteMissingElements(acc, elements.map(elm => elm.id));
      this.addOrUpdateChanges(acc, elements);
    };
  }

  private get viewDeleteAction() {
    return (action: PebViewDeleteAction) => (acc: DraftModel) => {
      for (const id of action.payload) {
        delete acc[id];
      }
    };
  }

  private get viewPatchAction() {
    return (action: PebViewPatchAction) => (acc: DraftModel) => {
      action.payload.forEach((elm) => {
        const element = elm as typeof action.payload[number];
        const existing = acc[element.id];

        if (!existing) {
          console.error(new Error('No View Element to patch found'));

          return;
        }

        if (existing.type === PebElementType.Vector) {
          if (existing.vector) {
            const { css, inner } = getVectorPatchElementStyles(element.style);

            const elmStyle = splitStyles(css);
            const style = {
              host: { ...existing.style.host, ...elmStyle.host },
              inner: { ...existing.style.inner, ...elmStyle.inner },
            };

            existing.vector = { ...existing.vector, styles: { ...existing.vector.styles, ...inner } };
            existing.style = style as any;
          }

          return;
        }

        if (elm.text) {
          acc[element.id].textHTML = this.getTextHtml(elm.text);
        }

        const elmStyle = splitStyles(element.style);

        const style = {
          host: { ...existing.style.host, ...elmStyle.host },
          inner: { ...existing.style.inner, ...elmStyle.inner },
        };
        acc[element.id] = { ...existing, ...element as any, style };
      });
    };
  }

  private readonly viewSetAction$ = this.actions$.pipe(ofActionDispatched(PebViewSetAction));

  private readonly viewUpdateAction$ = this.actions$.pipe(ofActionDispatched(PebViewUpdateAction));

  private readonly viewDeleteAction$ = this.actions$.pipe(ofActionDispatched(PebViewDeleteAction));

  private readonly viewPatchAction$ = this.actions$.pipe(ofActionDispatched(PebViewPatchAction));

  elements$: Observable<PebViewElement<PebViewStyle>[]> = merge(
    this.viewSetAction$.pipe(map(this.viewSetAction)),
    this.viewUpdateAction$.pipe(map(this.viewUpdateAction)),
    this.viewDeleteAction$.pipe(map(this.viewDeleteAction)),
    this.viewPatchAction$.pipe(map(this.viewPatchAction)),
  ).pipe(
    scan((acc, action) => {
      const res = produce(acc, draft => action(draft));

      return res;
    }, {} as MapModel),
    map(elements => Object.values(elements)),
    catchError((err, caught) => {
      console.error(err);

      return caught;
    }),
    shareReplay(1),
  );

  constructor(
    private readonly domSanitizer: DomSanitizer,
    private readonly actions$: Actions,
    private readonly store: Store,
  ) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  renderElements(elements: PebElement[], container?: { editMode: boolean }): PebViewElement<PebViewStyle>[] {
    const mapRecursive = (elms: PebElement[]): PebViewElement<PebViewStyle>[] => {
      const viewElements: PebViewElement<PebViewStyle>[] = [];

      elms.forEach((elm) => {
        const element = this.renderElement(elm, container);
        if (!element) {
          return [];
        }

        viewElements.push(element);
        viewElements.push(...mapRecursive([...elm.children ?? []]));
      });

      return viewElements;
    };

    const rootElements = elements.filter(e => !e.parent?.id);

    return mapRecursive(rootElements ?? []);
  }

  renderElement(elm: PebElement, container?: { editMode: boolean }): PebViewElement<PebViewStyle> {
    if (!elm) {
      return undefined;
    }

    const context = this.store.selectSnapshot(PebViewState.contexts)[elm.id];

    if (
      context?.dataType === PebIntegrationDataType.Object
      && elm?.integration?.dataSource?.params
      && elm?.integration?.dataSource?.dataType !== PebIntegrationDataType.Object
    ){
      context.value = evaluate(elm.integration.dataSource.params, context.parent.value ? context.parent : context);
    }

    const editMode = container?.editMode;
    let {
      styles = { ...elm.styles },
      text = elm.text,
      invisible = false,
      link = { ...elm.link },
    } = renderElementContext(elm, context);
    styles.zIndex = elm.parent?.children ? elm.parent.children.length - elm.index : 0;

    if (invisible) {
      return undefined;
    }

    let vector: PebViewVector | undefined;
    if (isVector(elm)) {
      const vectorRenderer = getVectorStyles(elm.styles);
      styles = vectorRenderer?.host ?? styles;

      if (elm.data.vector) {
        vector = { styles: vectorRenderer.inner, vector: elm.data.vector };
      }
    }

    if (text && styles.textStyles) {
      text = removeTextAttribute(text, Object.keys(styles.textStyles));
    }

    elm.styles = styles;

    const element: PebViewElement<PebViewStyle> = {
      id: elm.id,
      name: elm.name ? getNormalizedKey(elm.name) : undefined,
      type: elm.type,
      parent: elm.parent ? { id: elm.parent.id, type: elm.parent.type } : undefined,
      children: [...elm.children].map(child => child.id),
      style: editMode
        ? editorElementStyles(elm)
        : viewElementStyles(elm, styles, elm.screen, elm.parent?.styles),
      animations: elm.animations,
      textHTML: this.getTextHtml(text),
      text,
      integration: elm.integration,
      interactions: elm.interactions,
      link: { ...link },
      fill: styles.fill,
      vector,
      layout: styles.layout,
      screenKey: elm.screen?.key,
      pebStyles: elm.styles,
    };

    return element;
  }

  deleteMissingElements(acc: DraftModel, ids: string[]) {
    const newSet = new Set<string>(ids);
    let keys = Object.keys(acc);

    keys.forEach(key => !newSet.has(key) && delete acc[key]);
  }

  addOrUpdateChanges(acc: DraftModel, elements: PebViewElement<PebViewStyle>[]) {
    for (const elm of elements) {
      const existing = acc[elm.id];

      if (!existing || this.isViewElementChanged(existing, elm)) {
        acc[elm.id] = {
          ...elm,
          parent: elm.parent ? { id: elm.parent.id, type: elm.parent.type } : undefined,
        } as any;
      }
    }
  }

  isViewElementChanged(oldElm: Draft<PebViewElement<PebViewStyle>>, newElm: PebViewElement<PebViewStyle>): boolean {
    if (!oldElm || !newElm) {
      return true;
    }

    if (oldElm.parent?.id !== newElm.parent?.id) {
      return true;
    }

    if (oldElm.screenKey !== newElm.screenKey) {
      return true;
    }

    if (!isEqual(oldElm.style, newElm.style)) {
      return true;
    }

    if (!isEqual(oldElm.text, newElm.text)) {
      return true;
    }

    return false;
  }

  getTextHtml(text: Delta | undefined): string | SafeHtml {
    return isDeltaEmpty(text)
      ? undefined
      : this.domSanitizer.bypassSecurityTrustHtml(PebQuillRenderer.render(text));
  }
}

type MapModel = { [id: string]: PebViewElement<PebViewStyle> };
type DraftModel = Draft<MapModel>;
