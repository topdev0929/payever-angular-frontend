import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { BuilderApi } from '../api/builder-api.service';
import { BaseThemeInterface } from '../core.entities';
import { ThemeData } from '../theme.data';

const uuidRegex = /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/;

@Injectable({ providedIn: 'root' })
export class ThemeResolver implements Resolve<BaseThemeInterface> {
  constructor(private builderApi: BuilderApi, private themeData: ThemeData) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const editedTheme = route.queryParams.themeId;

    // piping from `of()` is intentional since angular expects observable
    // to emit completion before it will starts render route
    return of(null).pipe(
      switchMap(() => {
        // FIXME looks like it is legacy - need to remove and then remove
        if (editedTheme === 'new') {
          return this.themeData.getNewTheme().pipe(take(1));
        }

        if (uuidRegex.test(editedTheme)) {
          return this.themeData.getSpecificTheme(editedTheme).pipe(take(1));
        }

        return this.themeData.getActiveTheme().pipe(take(1));
      }),
    );
  }
}
