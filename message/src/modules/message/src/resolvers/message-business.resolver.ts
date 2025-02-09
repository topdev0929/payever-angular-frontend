import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { EnvService } from '@pe/common';
import { Observable } from 'rxjs';


@Injectable()
export class PeMessageBusinessResolver implements Resolve<any> {
  constructor(private envService: EnvService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | any {
    this.envService.businessId = state.url.split('business/')[1]?.split('/')[0];
  }
}
