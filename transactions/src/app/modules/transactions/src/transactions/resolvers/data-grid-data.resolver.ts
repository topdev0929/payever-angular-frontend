import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Resolve, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-es';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable, of, timer } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { WindowService } from '@pe/ng-kit/modules/window';
import { SearchTransactionsInterface, SettingsService } from '../../shared';
import {
    filtersSelector,
    getBusinessData,
    getColumnsData,
    getTransactions,
    GlobalStateInterface,
    setFilters
} from '../../shared/state-management';

@Injectable()
export class DataGridResolver implements CanActivate {

  constructor(
    private settingsService: SettingsService,
    private store: Store<GlobalStateInterface>,
    private localStorageService: LocalStorageService,
    private windowService: WindowService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
    this.settingsService.isEmbeddedMode = Boolean(route.queryParams['embedded']);
    this.settingsService.isPersonal = state.url.split('/')[1] === 'personal';
    this.settingsService.businessUuid = route.params['uuid'];
    this.settingsService.isPrivate = !route.data['businessMode']; // TODO Check that it works

    let prefilledConditions: SearchTransactionsInterface = null;
    if (Object.keys(route.queryParams).length) {
      if (route.queryParams['embedded']) {
        this.settingsService.embedded = true;
      }

      this.settingsService.parentBackUrl = route.queryParams['backUrl'];

      if (route.queryParams['pos']) {
        const id: string = route.queryParams['pos'];
        this.settingsService.parentApp = 'pos';
        this.settingsService.parentAppId = id;

        prefilledConditions = {
          configuration: {
            // value in channel_set_uuid should be array but it's not because it's hardcoded filter
            channel_set_uuid: {
              condition: 'is',
              value: [id]
            }
          },
          page: 1
        } as SearchTransactionsInterface;
      } else if (route.queryParams['shop']) {
        const id: string = route.queryParams['shop'];
        this.settingsService.parentApp = 'store';
        this.settingsService.parentAppId = id;

        prefilledConditions = {
          configuration: {
            // value in channel_set_uuid should be array but it's not because it's hardcoded filter
            channel_set_uuid: {
              condition: 'is',
              value: [id]
            }
          },
          page: 1
        } as SearchTransactionsInterface;
      }

      if (prefilledConditions) {
        this.store.dispatch(setFilters(prefilledConditions));
      }
    } else {
      let cachedFilters: any = this.localStorageService.retrieve(this.settingsService.getFiltersCacheKey(this.settingsService.businessUuid));
      cachedFilters = cloneDeep(cachedFilters);
      // delete to avoid showing of transactions with cache pos/shop mode
      if (cachedFilters && cachedFilters.configuration) {
        delete cachedFilters.configuration.channel_set_uuid;

        this.windowService.isMobile$.pipe(take(1)).subscribe(isMobile => {
          if (isMobile) {
            cachedFilters.page = 1; // For infinity scroll we do not save page between page reloads
          }
          this.store.dispatch(setFilters(cachedFilters));
        });
      }
    }

    this.store.select(filtersSelector).pipe(
      take(1))
      .subscribe((filters: any) => {
        const clonedFilters: any = cloneDeep(filters);
        if (!this.settingsService.isPersonal) {
          this.store.dispatch(getBusinessData(clonedFilters));
        } else {
          this.store.dispatch(getColumnsData());
          this.store.dispatch(getTransactions(clonedFilters));
        }
      });

    // return timer(15000).pipe(map(a => true));
    return of(true);
  }

}
