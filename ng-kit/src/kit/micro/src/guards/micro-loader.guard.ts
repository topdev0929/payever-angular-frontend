import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { MicroAppInterface, MicroDependencies } from '../types';
import { MicroLoaderService, MicroRegistryService } from '../services';

@Injectable()
export class MicroLoaderGuard implements CanActivate {

  constructor(private microLoader: MicroLoaderService,
              private microRegistryService: MicroRegistryService) {
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    const dependencies: MicroDependencies = route.data['dependencies'];
    const useMicroUrlsFromRegistry: boolean = route.data['useMicroUrlsFromRegistry'];

    if (dependencies && dependencies.micros) {
      if (useMicroUrlsFromRegistry) {
        const registeredApps: MicroAppInterface[] = this.microRegistryService.getMicroConfig('') as MicroAppInterface[];
        const observables: Observable<any>[] = registeredApps
          .filter(app => dependencies.micros.indexOf(app.code) > -1 && !this.microLoader.isScriptLoadedbyCode(app.code))
          .map(app => this.microLoader.loadScript(app.bootstrapScriptUrl, app.code));

        forkJoin(...observables).subscribe();
      } else {
        const micros: string[] = dependencies.micros;
        const observables: Observable<any>[] = micros.map((micro: string) => this.microLoader.loadBuild(micro));
        const joinedObservable: Observable<boolean> = forkJoin(...observables).pipe(
          take(1),
          map((results: boolean[]) => results.every((result: boolean) => !!result))
        );

        if (route.data['blocking']) {
          return joinedObservable;
        } else {
          joinedObservable.subscribe();
        }

        return forkJoin(...observables).pipe(
          map((results: boolean[]) => results.every((result: boolean) => !!result))
        );
      }
    }

    return true;
  }

}
