import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationExtras, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';

import { PebPage, PebPageVariant } from '@pe/builder/core';
import { deserializeLinkedList } from '@pe/builder/render-utils';
import { PebEditorState, PebSetActivePage } from '@pe/builder/state';


@Injectable({ providedIn: 'any' })
export class PebPageResolver implements Resolve<any> {

  constructor(
    private router: Router,
    private store: Store,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {    
    const activePage = this.store.selectSnapshot(PebEditorState.activePage);
    let pageId = route.queryParams.pageId;
    if (!activePage || activePage.id !== pageId) {
      const pages = this.store.selectSnapshot(PebEditorState.pages);

      if (pages && (!pageId || !pages[pageId])) {
        /** front page is not always set, fallback to first page */
        const list = deserializeLinkedList(Object.values(pages));
        const page = [...list].find((page: PebPage) => page.variant === PebPageVariant.Front) ?? list.head?.value;
        if (page) {
          pageId = page.id;
          
          const navigationExtras: NavigationExtras = {
            queryParams: { pageId: page.id },
            queryParamsHandling: 'merge' as const,
          };

          this.router.navigate([state.url], navigationExtras).then();
        }
      }

      this.store.dispatch(new PebSetActivePage(pageId));

      return of([]);
    }

    return of([]);
  }
}
