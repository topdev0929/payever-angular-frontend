import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnDestroy,
  PLATFORM_ID,
  ViewEncapsulation,
} from '@angular/core';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';

import { PebLinkType, PebRenderElementModel, PebClientElm } from '@pe/builder/core';
import { 
  PebRenderSetRootElementAction,
  PebViewElementClickedAction,
  PebViewElementMouseEnteredAction,
  PebViewElementMouseLeavedAction,
  PebViewPageScrollReadyAction,
} from '@pe/builder/view-actions';

import { CLIENT_CONTAINER, SSR_CONTAINER } from '../../constants';


@Component({
  selector: 'peb-client-renderer',
  templateUrl: 'renderer.component.html',
  styleUrls: ['renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PebClientRendererComponent implements AfterViewInit, OnDestroy {
  @Input() elements: { [id: string]: PebRenderElementModel } = {};

  destroy$ = new Subject<void>();
  linkType = PebLinkType;
  container = isPlatformBrowser(this.platformId) ? CLIENT_CONTAINER : SSR_CONTAINER;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    @Inject(DOCUMENT) private document: Document,
    private readonly store: Store,
    private actions$: Actions,
  ) {
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.store.dispatch(new PebViewPageScrollReadyAction(this.container.key, this.document.documentElement));

    this.actions$.pipe(
      ofActionDispatched(PebRenderSetRootElementAction),
      debounceTime(0),
      tap(() => {
        this.store.dispatch(new PebViewPageScrollReadyAction(this.container.key, this.document.documentElement));
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackBy = (index: number, item: PebClientElm): string => {
    return item.id;
  };

  elementClicked(element: PebRenderElementModel, htmlElement: HTMLElement) {
    this.store.dispatch(new PebViewElementClickedAction(element));

    return false;
  }

  mouseEntered(element: PebRenderElementModel, htmlElement: HTMLElement) {
    this.store.dispatch(new PebViewElementMouseEnteredAction(element));
  }

  mouseLeaved(element: PebRenderElementModel, htmlElement: HTMLElement) {
    this.store.dispatch(new PebViewElementMouseLeavedAction(element));
  }
}
