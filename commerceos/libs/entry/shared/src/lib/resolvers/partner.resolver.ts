import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, delay, mergeMap, retryWhen, tap } from 'rxjs/operators';

import { PartnerService } from '@pe/api';

@Injectable({ providedIn: 'root' })
export class PartnerResolver implements Resolve<any> {

  constructor(
    private router: Router,
    private partnerService: PartnerService,
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const { app, country, fragment, industry, plugin } = route.params;

    const redirectUrl = localStorage.getItem('plugin-redirect-url');
    if (redirectUrl) {
      return of(this.partnerService.getPartnerFromLocalStorage());
    }

    return this.partnerService.getPartnerData({ app, country, fragment, industry, plugin }).pipe(
      tap((data) => {
        localStorage.removeItem('pe-partners-data');
        localStorage.setItem('pe-partners-data', JSON.stringify(data));
      }),
      retryWhen(errors =>
        errors.pipe(
          mergeMap((err, i) => i >= 10 ? throwError(err) : of(err)),
          delay(1000)
        )
      ),
      catchError(() => {
        this.router.navigate([state.url.split('/').slice(0, -1).join('/')]);

        return EMPTY;
      }),
    );
  }
}
