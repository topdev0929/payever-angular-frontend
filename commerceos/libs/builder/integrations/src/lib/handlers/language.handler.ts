import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { merge, Subject } from 'rxjs';
import { catchError, filter, takeUntil, tap } from 'rxjs/operators';

import { PebIntegrationEventAction, PebLanguage } from '@pe/builder/core';

@Injectable()
export class PebIntegrationLanguageHandler implements OnDestroy {
  private destroy$ = new Subject<void>();

  private readonly switchLanguage$ = this.actions$.pipe(
    ofActionDispatched(PebIntegrationEventAction),
    filter(({ event }) => event === 'language.switch'),
    tap(({ payload }) => this.changeLanguage(payload.action.staticParams?.lang)),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly router: Router,
  ) {
    merge(this.switchLanguage$).pipe(
      takeUntil(this.destroy$),
      catchError((err) => {
        console.error(err);

        return err;
      })
    ).subscribe();
  }

  private changeLanguage(language: PebLanguage): void {
    if (!language) {
      this.router.navigate([], { queryParams: { lang: null }, queryParamsHandling: 'merge' });
    } else {
      this.router.navigate([], { queryParams: { lang: language.key }, queryParamsHandling: 'merge' });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
