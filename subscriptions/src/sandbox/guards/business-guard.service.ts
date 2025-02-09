import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';

// need to check if this guard still relevant
@Injectable()
export class BusinessGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const slug: string = route.params.slug;
    if (!slug) {
      return false;
    }

    return true;
  }
}
