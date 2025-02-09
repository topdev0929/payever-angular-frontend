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
import { PosClientTerminalService } from '@pe/builder-pos-client';

import { TerminalInterface } from '../services/pos.types';
import { PosApi } from '../services/pos/abstract.pos.api';
import { PosEnvService } from '../services/pos/pos-env.service';


@Injectable()
export class PebPosGuard implements CanActivate {

  constructor(
    private api: PosApi,
    @Inject(EnvService) private envService: PosEnvService,
    private terminalService: PosClientTerminalService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (route?.firstChild?.firstChild?.params.posId) {
      this.envService.posId = route.firstChild.firstChild.params.posId;
      return this.api.getSinglePos(route.firstChild.firstChild.params.posId).pipe(
        map((data: TerminalInterface) => {
          route.data = { ...route.data, terminal: data };
          this.terminalService.terminal = data;
          return true;
        }),
      );
    }

    return this.api.getPosList().pipe(
      switchMap((terminals: TerminalInterface[]) => {
        return terminals.length ?
          of(terminals) :
          this.api.createPos({
            name: this.envService.businessName || 'Terminal',
          }).pipe(
            map(terminal => [terminal]),
          );
      }),
      tap((terminals) => {
        const defaultTerminal: TerminalInterface = terminals.find((terminal: TerminalInterface) => terminal.active);

        if (!defaultTerminal) {
          this.envService.posId = terminals[0]._id;
          route.data = { ...route.data, terminal: terminals[0] };
          this.terminalService.terminal = terminals[0];
          return;
        }

        this.envService.posId = defaultTerminal._id;
        route.data = { ...route.data, terminal: defaultTerminal };
        this.terminalService.terminal = defaultTerminal;
      }),
      mapTo(true),
      catchError((err) => {
        console.error(err);
        return of(false);
      }),
    );
  }
}
