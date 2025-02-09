import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { SetTokens } from '@pe/checkout/store';

@Injectable()
export class SaveGuestTokenGuard {

  private readonly store = inject(Store);

  canActivate(): Observable<boolean> {
    let result = of(null);

    const urlParams = new URL(window.location.href).searchParams;
    const flowIdentifier = urlParams.get('flowIdentifier');
    const guestToken = urlParams.get('guest_token');
    if (guestToken) {
      result = result.pipe(
        mergeMap(() => guestToken
          ? this.store.dispatch(new SetTokens({ accessToken: guestToken }))
          : of(null)),
        map(() => true)
      );
    }
    if (flowIdentifier) {
      (window as any).PAYEVER_SESSION = flowIdentifier;
    }

    return result.pipe(map(() => true));
  }
}
