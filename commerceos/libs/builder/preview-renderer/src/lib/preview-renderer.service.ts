import { Injectable, OnDestroy } from '@angular/core';
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import { toBlob } from 'html-to-image';
import produce from 'immer';
import { Observable, Subject, from, merge } from 'rxjs';
import { debounceTime, filter, map, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder/api';
import { PEB_DEFAULT_FONT_FAMILY, PebPage, PebScreen, pebGenerateId } from '@pe/builder/core';
import { PebViewChangedAction } from '@pe/builder/renderer';
import {
  PebDeleteAction,
  PebLeavePage,
  PebOptionsState,
  PebPagesState,
  PebUpdateAction,
  PebUpdateElementDefAction,
  PebUpdatePagesPreview,
} from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';
import { PebShopContainer } from '@pe/resources/shared';

@Injectable()
export class PebPreviewRendererService implements OnDestroy {
  @Select(PebPagesState.activePage) private readonly page$!: Observable<PebPage>;
  @Select(PebOptionsState.scale) private readonly scale$!: Observable<number>;
  @Select(PebOptionsState.screen) private readonly screen$!: Observable<PebScreen>;

  private readonly maxHeight = 800;
  private readonly previewWidth = 105;

  preview = new Map<string, string>();
  previewChanged$ = new Subject();

  private renderer?: HTMLElement;

  private readonly viewSetAction$ = this.actions$.pipe(
    ofActionDispatched(PebUpdateAction, PebUpdateElementDefAction, PebDeleteAction),
    debounceTime(100),
    withLatestFrom(this.page$, this.scale$),
    tap(([_, page, scale]: [PebViewChangedAction, PebPage, number]) => this.takeScreenshot(page.id, scale)),
  );

  private readonly savePreview$ = this.actions$.pipe(
    ofActionDispatched(PebLeavePage),
    filter((action: PebLeavePage): action is PebLeavePage => !!action.page),
    map(({ page }) => page),
    withLatestFrom(this.scale$),
    switchMap(([page, scale]) => {
      const height = Math.min(this.renderer.clientHeight, this.maxHeight);

      return from(toBlob(this.renderer, {
          width: this.renderer.clientWidth * scale,
          height: height * scale,
          fontEmbedCSS: PEB_DEFAULT_FONT_FAMILY,
      })).pipe(
        map(blob => [blob, page]),
      );
    }),
    filter(([blob]: [Blob, PebPage]) => !!blob),
    switchMap(([blob, page]) => {
      return this.api.uploadImage(
        PebShopContainer.Images,
        new File([blob], `builder-page-preview-${pebGenerateId()}.png`),
        false,
      ).pipe(
        map(response => response.blobName),
        withLatestFrom(this.screen$),
        tap(([url, screen]) => {
          const payload = produce(page, (draft) => {
            if (!draft.preview) {
              draft.preview = { [screen.key]: url };
            } else {
              draft.preview[screen.key] = url;
            }
          });

          this.store.dispatch(new PebUpdatePagesPreview(payload));
        }),
      );
    }),
  );

  constructor(
    private readonly api: PebEditorApi,
    private readonly store: Store,
    private readonly actions$: Actions,
    private readonly destroy$: PeDestroyService,
  ) {
    merge(this.viewSetAction$, this.savePreview$).pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.preview.clear();
  }

  setRenderer(renderer: HTMLElement): void {
    this.renderer = renderer;
  }

  private takeScreenshot(id: string, scale: number): void {
    if (this.renderer) {
      const cloned = this.renderer.cloneNode(true) as HTMLElement;
      cloned.style.width = '100%';
      cloned.style.height = 'unset';
      cloned.style.marginLeft = '-50%';
      cloned.style.scale = `${this.previewWidth / (this.renderer.clientWidth * scale)}`;

      this.preview.set(id, cloned.outerHTML);
      this.previewChanged$.next();
    }
  }
}
