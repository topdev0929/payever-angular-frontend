import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PebAppType } from '@pe/builder-core';

@Injectable({ providedIn: 'root' })
export class EnvService {
  app: PebAppType;
  appId: string;
  business: string;
  channelSet: string;
  domain: string;
  theme: string;
  domainData: any;
  defaultDomain = 'test321123qwedsa';
  defaultStoreLoading = false;
  loadBackgroundImage = false;
  loadingPasswordedStore = false;
  backgroundImageUrl = 'url(https://payevertest.azureedge.net/images/commerseos-background.jpg)';
  isLive$: BehaviorSubject<boolean> = new BehaviorSubject(true);
}
