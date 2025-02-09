import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, UrlTree,Router,RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PebEnvService } from '@pe/builder/core';

import { BAD_REQUEST, PE_APPOINTMENTS_FIRST_NETWORK } from '../constants';
import { PeAppointmentsAccessApiService, PeAppointmentsNetworksApiService } from '../services';

@Injectable()
export class PeAppointmentsNetworkGuard implements CanActivate {

  constructor(
    private pebEnvService: PebEnvService,

    private peAppointmentsAccessApiService: PeAppointmentsAccessApiService,
    private peAppointmentsNetworksApiService: PeAppointmentsNetworksApiService,

    private readonly router: Router,
    private readonly env: PeAppEnv,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const applicationId = route?.firstChild?.firstChild?.params.app;

    if (applicationId) {
      this.pebEnvService.applicationId = applicationId;
      this.pebEnvService.shopId = applicationId;

      return this.peAppointmentsNetworksApiService
        .getNetwork(applicationId)
        .pipe(
          map((network) => {
            route.data = { ...route.data, network };
            this.env.id = applicationId;

            return true;
          }));
    }

    PE_APPOINTMENTS_FIRST_NETWORK.name = this.pebEnvService.businessData.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-');

    const createFirstNetwork$ = this.peAppointmentsNetworksApiService
      .createNetwork(PE_APPOINTMENTS_FIRST_NETWORK)
      .pipe(
        switchMap((network) => {
          return forkJoin([
            of(network),
            this.peAppointmentsAccessApiService
              .getAccessConfig(network._id),
          ]);
        }),
        switchMap(([network, accessConfig]) => {
          const { _id, appointmentNetwork } = accessConfig;

          return forkJoin([
            of(network),
            this.peAppointmentsAccessApiService
              .updateAccessConfig(appointmentNetwork, _id, { internalDomain: network.name }),
          ]);
        }),
        map(([network]) => [network]));

    return this.peAppointmentsNetworksApiService
      .getNetworks()
      .pipe(
        switchMap((networks) => {
          return networks.length
            ? of(networks)
            : createFirstNetwork$;
        }),
        switchMap((networks) => {
          const defaultNetwork = networks
            .find(network => network.isDefault);

          return defaultNetwork
            ? of(defaultNetwork)
            : this.peAppointmentsNetworksApiService
                .setNetworkAsDefault(networks[0]._id);
        }),
        map((defaultNetwork) => {
          this.pebEnvService.applicationId = defaultNetwork._id;
          this.pebEnvService.shopId = defaultNetwork._id;
          route.data = { ...route.data, network: defaultNetwork };
          this.env.id = defaultNetwork._id;

          let params: any = {};
          let node = state.root;
          while (node) {
            params = { ...params, ...node?.params };
            node = node.firstChild;
          }
          this.env.business = params.slug;
          const cmd = route.pathFromRoot.reduce((acc, e) => [...acc, ...e.url.map(u => u.path)], []);

          return this.router.createUrlTree([...cmd, defaultNetwork._id]);
        }),
        catchError(() => {
          this.pebEnvService.applicationId = BAD_REQUEST;
          this.pebEnvService.shopId = BAD_REQUEST;

          return of(true);
        }));
  }
}
