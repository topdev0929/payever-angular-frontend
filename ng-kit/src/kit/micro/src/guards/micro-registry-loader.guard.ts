import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { MicroDependencies } from '../types';
import { MicroLoaderService } from '../services';

@Injectable()
/**
 * This is a not blocking guard, it just helps to preload required registry hashes for micros.
 * Final blocking check of this hashes will be in micro loading guard
 */
export class MicroRegistryLoaderGuard implements CanActivate {

  constructor(private microLoader: MicroLoaderService) {
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    const dependencies: MicroDependencies = route.data['dependencies'];

    if (dependencies && dependencies.micros) {
      const micros: string[] = dependencies.micros;
      const observables: Observable<any>[] = micros.map((micro: string) => {
        return this.microLoader.loadBuildHash(micro);
      });

      const joinedObservable: Observable<boolean> = forkJoin(...observables).pipe(
        take(1),
        map((results: boolean[]) => results.every((result: boolean) => !!result))
      );

      if (route.data['blocking']) {
        return joinedObservable;
      } else {
        joinedObservable.subscribe();
      }
    }

    return true;
  }

}
