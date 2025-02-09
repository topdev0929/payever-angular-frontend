import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PebViewPageSetAction, PebViewQueryPatchAction } from '@pe/builder/view-actions';
import { PebViewCookiesPermissionService } from '@pe/builder/view-handlers';

import { getUrlWithoutParams } from '../renderer/helpers';
import { PebClientPagesService } from '../services';

@Injectable({ providedIn: 'root' })
export class PebClientPageResolver implements Resolve<any> {
  constructor(
    private readonly store: Store,
    private route: ActivatedRoute,
    private readonly pagesService: PebClientPagesService,
    private readonly cookiesPermissionService: PebViewCookiesPermissionService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const url = getUrlWithoutParams(state.url.trimStart());
    const page = this.pagesService.findPageByUrl(url);
    if (!page) {
      return of(undefined);
    }

    const urlParameters = { urlParameters: route.queryParams };
    this.store.dispatch(new PebViewQueryPatchAction({ ...urlParameters }));

    if (page.rootElement) {
      this.store.dispatch(new PebViewPageSetAction(page?.id));

      return of(page);
    }

    return forkJoin([
      this.pagesService.getPageElementDefs$(page.id),
      this.pagesService.getPageElementDefs$(page.master?.page),
    ]).pipe(
      map(([pageElementsDefs, masterPageElementsDef]) => {
        this.pagesService.processElementDefs(page.id, pageElementsDefs, masterPageElementsDef);
        this.store.dispatch(new PebViewPageSetAction(page?.id));

        return page;
      }),
      catchError((err) => {
        console.error(err);
        this.store.dispatch(new PebViewPageSetAction(page?.id));

        return of(page);
      }),
    );
  }
}
