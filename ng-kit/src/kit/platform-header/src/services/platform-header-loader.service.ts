import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MicroLoaderService, MicroRegistryService } from '../../../micro/src/services';
import { MicroAppInterface } from '../../../micro/src/types';

@Injectable()
export class PlatformHeaderLoaderService {

  constructor(private microRegistryService: MicroRegistryService,
              private microLoaderService: MicroLoaderService) {}

  loadAppHeaderScript(rootComponentTag: string, businessId: string, appName: string, inputData: any = {}): Observable<boolean> {
    return this.microRegistryService.getRegisteredMicros(businessId).pipe(
      switchMap(() => {
        // get micro data about apps like Shop, POS. It should have platformHeader field
        const mainAppMicro: MicroAppInterface = this.microRegistryService.getMicroConfig(appName) as MicroAppInterface;
        let obs$: Observable<boolean> = of(false);
        if (mainAppMicro && mainAppMicro.platformHeader) {
          this.createHeaderAppElement(rootComponentTag, mainAppMicro.platformHeader.tag, inputData);
          obs$ = this.microLoaderService.loadScript(
            mainAppMicro.platformHeader.bootstrapScriptUrl,
            mainAppMicro.platformHeader.tag
          );
        }
        return obs$;
      }),
    );
  }

  private createHeaderAppElement(rootComponentTag: string, tagName: string, inputData: any): void {
    const headerAppElement: HTMLElement = document.createElement(tagName);

    // tslint:disable:forin
    for (const key in inputData) {
      headerAppElement.dataset[key] = inputData[key];
    }

    document.querySelector(rootComponentTag).after(headerAppElement);
  }

}
