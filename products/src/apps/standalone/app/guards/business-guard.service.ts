import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';


// need to check if this guard still relevant
@Injectable()
export class BusinessGuard implements CanActivate {

  constructor() {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const slug = route.params.slug;
    return !!slug;
  }

}
