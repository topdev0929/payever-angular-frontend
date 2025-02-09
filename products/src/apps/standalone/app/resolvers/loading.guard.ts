import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';


@Injectable()
export class LoadingGuard implements CanActivate {

  constructor() {
  }

  canActivate(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<boolean> {
    return of(true);
  }

}
