import { Injector } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { PlatformService } from '../../../common/src/services';
import { MicroLoaderService, MicroRegistryService } from '../../../micro/src/services';
import { MicroAppInterface } from '../../../micro/src/types';
import { PlatformHeaderService } from '../services';

export abstract class BasePlatformHeaderLoaderGuard implements CanActivate {

  protected platformHeaderService: PlatformHeaderService = this.injector.get(PlatformHeaderService);
  protected platformService: PlatformService = this.injector.get(PlatformService);
  protected microLoaderService: MicroLoaderService = this.injector.get(MicroLoaderService);
  protected microRegistryService: MicroRegistryService = this.injector.get(MicroRegistryService);

  protected businessId: string;
  protected appRootTagName: string;

  private headerAppElement: HTMLElement;

  constructor(protected injector: Injector) {}

  canActivate(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<boolean> {
    if (this.needShowHeaderOfAnotherApp(activatedRouteSnapshot)) { //  && !this.platformHeaderService.isHeaderHasData
      this.businessId = this.getBusinessId(activatedRouteSnapshot);
      this.appRootTagName = this.getAppRootTagName(activatedRouteSnapshot);

      const inputData: any = this.getHeaderAppInputData(activatedRouteSnapshot);
      const appName: string = this.getHeaderAppName(activatedRouteSnapshot);
      let mainAppMicro: MicroAppInterface;

      // get info about micros because page have no this after refresh
      const loadHeader$: Observable<boolean> = this.microRegistryService.getRegisteredMicros(this.businessId).pipe(
        switchMap(() => {
          // get micro data about apps like Shop, POS. It should have platformHeader field
          mainAppMicro = this.microRegistryService.getMicroConfig(appName) as MicroAppInterface;
          let obs$: Observable<boolean> = of(false);
          if (mainAppMicro && mainAppMicro.platformHeader) {
            this.removeExisitingHeaderApp(mainAppMicro.platformHeader.tag);
            this.createHeaderAppElement(mainAppMicro.platformHeader.tag, inputData);
            obs$ = this.microLoaderService.loadScript(
              mainAppMicro.platformHeader.bootstrapScriptUrl,
              mainAppMicro.platformHeader.tag
            );
          }
          return obs$;
        }),
        switchMap((scriptDownloaded: boolean) => {
          // when script of header app is downloaded it created automaticaly and set header controls.
          // here we wait when header data set and only after that can activate routes of host app
          return scriptDownloaded
            ? this.platformHeaderService.platformHeaderSubject$.value
              ? of(this.platformHeaderService.platformHeaderSubject$.value)
              : this.platformHeaderService.platformHeader$.pipe(filter(header => !!header), take(1))
            : of(null);
        }),
        map(() => {
          if (mainAppMicro && mainAppMicro.platformHeader) {
            this.microLoaderService.unloadScript(mainAppMicro.platformHeader.bootstrapScriptUrl);
          }
          return true;
        })
      );

      if (activatedRouteSnapshot.data['loadHeaderAsync'] === true) {
        loadHeader$.subscribe();
        return of(true);
      } else {
        return loadHeader$;
      }
    } else {
      return of(true);
    }
  }

  /**
   * Return name of app that set header controls (for exmaple SHOP or POS)
   */
  protected abstract getHeaderAppName(activatedRouteSnapshot: ActivatedRouteSnapshot): string;

  protected abstract needShowHeaderOfAnotherApp(activatedRouteSnapshot: ActivatedRouteSnapshot): boolean;

  protected abstract getBusinessId(activatedRouteSnapshot: ActivatedRouteSnapshot): string;

  /**
   * Tag of component in app where header app is added. For example if we open Products but need to show header of SHOP
   * it will be some tag of products app.
   * Element with this tag should already exist on page when guard works.
   */
  protected abstract getAppRootTagName(activatedRouteSnapshot: ActivatedRouteSnapshot): string;

  /**
   * App should provide to the header app some input data (like business or shop id) via data- attributes.
   * Method hshould return object.
   */
  protected abstract getHeaderAppInputData(activatedRouteSnapshot: ActivatedRouteSnapshot): any;

  private createHeaderAppElement(tagName: string, inputData: any): void {
    this.headerAppElement = document.createElement(tagName);

    // tslint:disable:forin
    for (const key in inputData) {
      this.headerAppElement.dataset[key] = inputData[key];
    }

    document.querySelector(this.appRootTagName).after(this.headerAppElement);
  }

  private removeExisitingHeaderApp(tagName: string): void {
    const existingApp: HTMLElement = document.querySelector(tagName);
    if (existingApp) {
      existingApp.remove();
    }
  }
}
