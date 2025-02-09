
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Inject, Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';


@Injectable()
export class MailResolver implements Resolve<any> {
  constructor(
    private router: Router,    
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {

    // TODO: redirect doesn't work
    // if (!this.envService.shopId) {
    //   return this.router.createUrlTree(['./list']);
    // }

    return of(null)
  }

}
