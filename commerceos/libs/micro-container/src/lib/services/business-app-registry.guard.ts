import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { MicroRegistryService } from '@pe/common';
import { BusinessState } from '@pe/user';

@Injectable({ providedIn: 'root' })
export class BusinessAppRegistryGuard implements CanActivate {

  @SelectSnapshot(BusinessState.businessUuid) businessId:string;

  constructor(
    private router: Router,
    private microRegistryService: MicroRegistryService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | Observable<boolean> {
    return this.microRegistryService.getRegisteredMicros(this.businessId).pipe(
      catchError(() => of([])),
      map(() => true),
      catchError((error: any, caught: Observable<boolean>) => {
        this.router.navigate(['switcher']);

        return of(false);
      }),
    );
  }
}
