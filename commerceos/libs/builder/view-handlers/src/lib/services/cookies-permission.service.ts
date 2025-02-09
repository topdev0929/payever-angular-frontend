import { isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Store } from '@ngxs/store';

import { PebViewCookiesPermission } from '@pe/builder/core';
import { PebViewQueryPatchAction } from '@pe/builder/view-actions';

const COOKIES_PERMISSION = 'cookie_allowed';

@Injectable()
export class PebViewCookiesPermissionService {

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private readonly store: Store,
  ) {
  }

  initialize(): PebViewCookiesPermission | undefined {
    if (isPlatformServer(this.platformId)) {
      return undefined;
    }

    let cookiesPermission: PebViewCookiesPermission | undefined = undefined;
    const data = localStorage.getItem(COOKIES_PERMISSION);

    if (!data) {
      this.store.dispatch(new PebViewQueryPatchAction({
        cookiesPermission: {
          isSet: false,
          isAllowed: false,
        },
      }));

      return;
    }

    try {
      cookiesPermission = JSON.parse(data);
      this.store.dispatch(new PebViewQueryPatchAction({
        cookiesPermission: {
          isSet: true,
          isAllowed: cookiesPermission?.isAllowed ?? false,
        },
      }));
    } catch (error) { }

    return cookiesPermission;
  }

  setCookiesPermission(data: PebViewCookiesPermission) {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    this.store.dispatch(new PebViewQueryPatchAction({ cookiesPermission: data }));
    localStorage.setItem(COOKIES_PERMISSION, JSON.stringify(data));
  }
}
