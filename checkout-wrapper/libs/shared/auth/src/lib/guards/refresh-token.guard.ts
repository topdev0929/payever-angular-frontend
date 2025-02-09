import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthSelectors, RefreshToken, SetTokens, isExpired } from '@pe/checkout/store/auth';

@Injectable()
export class RefreshTokenGuard {

  private readonly store = inject(Store);

  private readonly accessToken = this.store.selectSnapshot(AuthSelectors.accessToken);
  private readonly refreshToken = this.store.selectSnapshot(AuthSelectors.refreshToken);

  canActivate(): Observable<boolean> {
    if (
      this.accessToken
      && isExpired(this.accessToken)
      && this.refreshToken && !isExpired(this.refreshToken)
    ) {
      return this.store.dispatch(new RefreshToken(this.refreshToken)).pipe(map(() => true));
    }

    if (this.refreshToken && isExpired(this.refreshToken)) {
      return this.store.dispatch(new SetTokens({ accessToken: null, refreshToken: null })).pipe(
        map(() => true),
      );
    }

    return of(true);
  }
}
