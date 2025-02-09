import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { flatMap, map, switchMap, shareReplay } from 'rxjs/operators';

import { TranslationLoaderService } from '../services';
import { retrieveLocale } from '../lib';
import { EnvironmentConfigInterface, EnvironmentConfigService } from '../../../environment-config';

@Injectable()
export class ActivateUserLangGuard implements CanActivate {

  private userAccount$: Observable<any> = this.configService.getConfig$().pipe(
    switchMap((config: EnvironmentConfigInterface) => this.httpClient.get(`${config.backend.users}/api/user`)),
    shareReplay(1)
  );

  constructor(
    private httpClient: HttpClient,
    private configService: EnvironmentConfigService,
    private translationLoaderService: TranslationLoaderService
  ) { }

  canActivate(): Observable<boolean> {
    return this.userAccount$.pipe(
      flatMap((accountModel: any) => {
        if (accountModel && accountModel.language && retrieveLocale() !== accountModel.language) {
          return this.translationLoaderService.reloadTranslations(accountModel.language).pipe(
            map(() => true)
          );
        } else {
          return of(true);
        }
      })
    );
  }

}
