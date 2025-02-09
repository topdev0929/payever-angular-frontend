import { Inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, mapTo, switchMap, tap } from 'rxjs/operators';

import { EnvService } from '@pe/common';
import { PeSharedCheckoutStoreService } from '@pe/shared/checkout';

import { TerminalInterface, PosEnvService, PosApi } from '../services';


@Injectable()
export class PebPosGuard implements CanActivate {

  constructor(
    private api: PosApi,
    @Inject(EnvService) private envService: PosEnvService,
    private posStore: PeSharedCheckoutStoreService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (route?.firstChild?.firstChild?.params.posId) {
      this.envService.posId = route.firstChild.firstChild.params.posId;

      return this.api.getPos(route.firstChild.firstChild.params.posId).pipe(
        map((data: TerminalInterface) => {
          route.data = { ...route.data, terminal: data };
          this.posStore.app = data;

          return true;
        }),
      );
    }

    return this.api.getList().pipe(
      switchMap((terminals: TerminalInterface[]) => {
        return terminals.length ?
          of(terminals) :
          this.api.create({
            name: this.envService.businessName || 'Terminal',
          }).pipe(
            map(terminal => [terminal]),
          );
      }),
      tap((terminals: TerminalInterface[]) => {
        const defaultTerminal: TerminalInterface = terminals.find((terminal: TerminalInterface) => terminal.active);

        if (!defaultTerminal) {
          this.envService.posId = terminals[0]._id;
          route.data = { ...route.data, terminal: terminals[0] };
          this.posStore.app = terminals[0];

          return;
        }

        this.envService.posId = defaultTerminal._id;
        route.data = { ...route.data, terminal: defaultTerminal };
        this.posStore.app = defaultTerminal;
      }),
      mapTo(true),
      catchError((err) => {
        console.error(err);

        return of(false);
      }),
    );
  }
}
