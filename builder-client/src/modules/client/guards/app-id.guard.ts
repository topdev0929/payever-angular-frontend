import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';

const UUID_REGEXP: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class AppIdGuard implements CanActivate {

  canActivate(route: ActivatedRouteSnapshot): boolean {
    return UUID_REGEXP.test(route.params['appId']);
  }
}
