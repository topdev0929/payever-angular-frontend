import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mapTo, tap } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PebAppDTO } from '@pe/builder/api';

import { BUILDER_STATES_RESET_ACTIONS } from './constants';

@Injectable({ providedIn: 'any' })
export class PeBuilderAppGuard implements CanActivate, CanLoad {

  constructor(
    private readonly router: Router,
    private readonly env: PeAppEnv,
    private readonly http: HttpClient,
    private readonly store: Store,
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    this.resetStates();

    let params: any = {};
    let node = state.root;
    while (node) {
      params = { ...params, ...node?.params };
      node = node.firstChild;
    }

    this.env.business = params.slug;

    const cmd = route.pathFromRoot.reduce((acc, e) => [...acc, ...e.url.map(u => u.path)], []);
    const baseUrl = `${this.env.api}/api/business/${this.env.business}/${this.env.type}`;

    if (params.app) {
      return this.http.get<PebAppDTO>(`${baseUrl}/${params.app}`).pipe(
        tap(({ id }) => {
          this.env.id = id;
        }),
        mapTo(true),
        catchError(() => {
          return of(this.router.createUrlTree(cmd.slice(0, -1)));
        }),
      );
    } else {
      return this.http.get<{ id: string }>(`${baseUrl}/default`).pipe(
        tap(({ id }) => {
          this.env.id = id;
        }),
        map(({ id }) => {
          return this.router.createUrlTree([...cmd, id]);
        }),
        catchError(() => {
          return of(false);
        }),
      );
    }
  }

  canLoad(
    route: Route,
    segments: UrlSegment[],
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }

  private resetStates(): void {
    const actions = BUILDER_STATES_RESET_ACTIONS;
    this.store.dispatch(actions.map(action => new action()));
  }
}
