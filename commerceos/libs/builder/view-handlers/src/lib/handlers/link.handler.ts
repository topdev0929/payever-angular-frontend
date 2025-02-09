import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { tap } from 'rxjs/operators';

import {
  PebAnchorLink,
  PebContainerType,
  PebExternalUrl,
  PebInternalPage,
  PebLinkTarget,
  PebLinkType,
  PebRenderContainer,
  PebRenderElementModel,
} from '@pe/builder/core';
import { getNormalizedKey } from '@pe/builder/render-utils';
import {
  PebViewElementClickedAction,
  PebViewPageScrollReadyAction,
  PebViewElementScrollIntoViewAction,
  PebViewPageLeavingAction,
  PebViewElementScrollToTopAction,
} from '@pe/builder/view-actions';

import { PebViewElementService } from '../services';

import { PebViewBaseHandler } from './base-view.handler';


@Injectable()
export class PebViewLinkHandler extends PebViewBaseHandler {
  private linkNavigator: { [key: string]: (element: PebRenderElementModel) => void } = {
    [PebLinkType.InternalPage]: model => this.handleInternalPage(model),
    [PebLinkType.Anchor]: model => this.handleAnchorLink(model),
    [PebLinkType.ExternalUrl]: model => this.handleExternalUrl(model),
  }

  private targetMap: { [key in PebLinkTarget]: string } = {
    [PebLinkTarget.Blank]: '_blank',
    [PebLinkTarget.Self]: '_self',
    [PebLinkTarget.Modal]: '',
  }

  private click$ = this.actions$.pipe(
    ofActionDispatched(PebViewElementClickedAction),
    tap((action: PebViewElementClickedAction) => {
      const element = this.elementService.getElementById(action.element?.id);
      const type = element?.link?.type;
      const navigator = type && this.linkNavigator[type];
      navigator && navigator(element as any);
    })
  );

  pageReady$ = this.actions$.pipe(
    ofActionDispatched(PebViewPageScrollReadyAction),
    tap((action: PebViewPageScrollReadyAction) => {
      const fragment = this.route.snapshot.fragment?.toLowerCase();
      if (!fragment) {
        return;
      }

      const element = this.elementService.getElementByName(getNormalizedKey(fragment));
      this.scrollIntoView(element);
    }),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly store: Store,
    private readonly elementService: PebViewElementService,
  ) {
    super();
    this.startObserving(
      this.click$,
      this.pageReady$,
    );
  }

  private handleInternalPage(element: PebRenderElementModel): void {
    const link = element.link as PebInternalPage;

    const queryParams = { ...link.urlParameters };
    const isDashboard = this.isDashboard(element.container);
    isDashboard && (queryParams.pageId = link.pageId);

    const anchor = link.anchorElement
      ? { fragment: link.anchorElement.name }
      : {};

    this.router.navigate(isDashboard ? [] : [link.url], {
      ...anchor,
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });

    this.store.dispatch(new PebViewPageLeavingAction());
    !link.anchorElement?.id && this.store.dispatch(new PebViewElementScrollToTopAction());
  }

  private handleAnchorLink(element: PebRenderElementModel): void {
    const link = element.link as PebAnchorLink;
    if (!link?.anchorElementId) {
      return;
    }

    const target = this.elementService.getElementById(link.anchorElementId);
    this.scrollIntoView(target);
  }

  private handleExternalUrl(element: PebRenderElementModel): void {
    const link = element?.link as PebExternalUrl;
    if (!link) {
      return;
    }
    const linkTarget = link.target ? this.targetMap[link.target] : '_self';
    const target = this.isDashboard(element.container)
      ? '_bank'
      : linkTarget;
    window.open(link.url, target);

    this.store.dispatch(new PebViewPageLeavingAction());
  }

  private scrollIntoView(element: PebRenderElementModel | undefined) {
    element && this.store.dispatch(new PebViewElementScrollIntoViewAction(element));
  }

  private isDashboard(container: PebRenderContainer | undefined): boolean {
    return container?.key === PebContainerType.Dashboard;
  }
}
