import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Actions, Select, Store } from '@ngxs/store';
import { fromEvent, merge, Observable, ReplaySubject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  startWith,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { PebDropFileAction, PebRenderPebElementsAction } from '@pe/builder/actions';
import {
  PebRenderContainer,
  PebScreen,
  PebEditorViewport,
} from '@pe/builder/core';
import { isDropEvent, PebEventsService } from '@pe/builder/events';
import { PebPreviewRendererService } from '@pe/builder/preview-renderer';
import { PebElement } from '@pe/builder/render-utils';
import { PebRendererService, PebViewClearAction } from '@pe/builder/renderer';
import { PebGridService } from '@pe/builder/services';
import {
  PebEditorState,
  PebEditTextModel,
  PebElementsState,
  PebLeavePage,
  PebOptionsState,
} from '@pe/builder/state';
import { PebViewContainerSetAction } from '@pe/builder/view-actions';
import { PebViewElementService } from '@pe/builder/view-handlers';
import { PebDeviceService, PeDestroyService } from '@pe/common';

import { PebContextMenuService, PebViewportHandler } from './services';
import { PebKeyboardHandler } from './services/keyboard.handler';


@Component({
  selector: 'peb-editor-renderer',
  templateUrl: './editor-renderer.component.html',
  styleUrls: ['editor-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PebViewportHandler,
    PeDestroyService,
    PebViewportHandler,
    PebKeyboardHandler,
  ],
})
export class PebEditorRendererComponent implements OnDestroy {
  @ViewChild('editorRenderer', { read: ElementRef, static: true }) editorRenderer: ElementRef;
  @Select(PebOptionsState.scaleToFit) scaleToFit$!: Observable<boolean>;
  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;
  @Select(PebEditorState.viewport) viewport$!: Observable<PebEditorViewport>;
  @Select(PebEditorState.editText) editText$!: Observable<PebEditTextModel>;

  iframe$ = new ReplaySubject<HTMLIFrameElement>(1);
  elements$ = this.rendererService.elements$;
  isLoading$ = this.rendererService.elements$.pipe(
    startWith([]),
    map(elements => !elements?.length),
  );

  maxWidth = 5000;
  maxHeight = 5000;

  renderContainer: PebRenderContainer = { key: 'editor', editMode: true, renderScripts: false };
  cursor$ = this.eventsService.cursor$.pipe(distinctUntilChanged());

  viewBox$ = this.viewport$.pipe(
    map(viewport => ({ width: viewport.page.originalWidth, height: viewport.page.originalHeight })),
    takeUntil(this.destroy$),
  );

  scale$ = this.viewport$.pipe(map(viewport => `scale(${viewport.scale})`));

  transform$ = this.viewport$.pipe(map(({ scale }) => `scale(${Math.max(1, 1 / scale)})`));

  constructor(
    private readonly destroy$: PeDestroyService,
    private readonly deviceService: PebDeviceService,
    private readonly store: Store,
    private readonly actions: Actions,
    private readonly eventsService: PebEventsService,
    private readonly contextMenuService: PebContextMenuService,
    private readonly gridService: PebGridService,
    private readonly rendererService: PebRendererService,
    private readonly previewRendererService: PebPreviewRendererService,
    private readonly elementService: PebViewElementService,
  ) {
    const dropEvent$ = this.eventsService.events$.pipe(
      filter(ev => isDropEvent(ev)),
      tap(ev => this.store.dispatch(new PebDropFileAction(ev.originalEvent as DragEvent))),
    );

    merge(
      this.gridService.resize$,
      dropEvent$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();

    this.store.dispatch(new PebViewContainerSetAction(this.renderContainer));
  }

  ngOnDestroy(): void {
    this.store.dispatch(new PebLeavePage(this.store.selectSnapshot(PebEditorState.activePage)));
  }

  onLoad(iframe: HTMLIFrameElement) {
    const doc = iframe.contentDocument;
    doc.open();
    doc.write(
      `<!DOCTYPE html><html><head><base href="/"></head><body spellcheck="false" class="scrollbar"></body></html>`,
    );
    doc.close();

    const style = doc.createElement('style');
    style.innerText = `html, body {
      background: transparent !important;
      min-width: 100% !important;
      min-height: 100% !important;
    }
    html {
      overflow: hidden;
      box-sizing: border-box;
    }
    body {
      margin: 0;
      box-sizing: border-box;
      overflow: scroll !important;
      content-visibility: auto;
      user-select: none;
    }
    `;
    doc.head.appendChild(style);

    const obs = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((n) => {
          if (['style', 'link'].includes(n.nodeName.toLowerCase())) {
            doc.head.appendChild(n.cloneNode(true));
          }
        });
      });
    });

    obs.observe(document.head, { childList: true });

    document.querySelectorAll('link, style').forEach((htmlElement) => {
      doc.head.appendChild(htmlElement.cloneNode(true));
    });

    doc.body.appendChild(this.editorRenderer.nativeElement);

    const orientationChange$ = fromEvent(window, 'orientationchange').pipe(
      tap(() => {
        if (this.deviceService.isMobile) {
          this.deviceService.landscape = window.orientation === 90 || window.orientation === -90;
        }
      }),
    );

    merge(
      orientationChange$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();

    this.eventsService.setContentElement(iframe);

    this.iframe$.next(iframe);
  }

  contextMenu(event: MouseEvent, iframe: HTMLIFrameElement) {
    event.preventDefault();
    const { x, y } = iframe.getBoundingClientRect();
    this.contextMenuService.open(event.clientX + x, event.clientY + y);
  }

  initRenderer(rendererContainer: HTMLElement): void {
    this.previewRendererService.setRenderer(rendererContainer);
    this.store.dispatch(new PebViewClearAction());
    this.store.dispatch(new PebRenderPebElementsAction());
  }
}
