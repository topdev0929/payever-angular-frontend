import { EventEmitter, Inject, Injectable, Injector, OnDestroy } from '@angular/core';
import { concat, forkJoin, Observable, of, Subject } from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { BaseOnboardingService } from '../base-onboarding.class';
import { ActionDTO } from '../models';

import { OnboardingUtilsService } from './utils.service';

@Injectable({ providedIn: 'root' })
export class OnboardingService extends BaseOnboardingService implements OnDestroy {
  public partnerAfterActions: EventEmitter<any> = new EventEmitter();
  public actionController = new Subject();

  private destroy$ = new Subject<void>();

  constructor(
    private onboardingUtilsService: OnboardingUtilsService,
    @Inject(PE_ENV) private envConfig: EnvironmentConfigInterface,
    injector: Injector,
  ) {
    super(injector);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  runAfterActions(actionsArray: ActionDTO[], id: string, partnerName): Observable<unknown> {
    this.onboardingUtilsService.captureValue = {
      businessId: id,
    };
    const actions = this.sortActionsByOrderId(actionsArray);

    const reqsDict = actions.reduce((acc, curr) => {
      curr.url = this.onboardingUtilsService.parseActionString(curr.url);

      const key = curr.priority ?? 0;
      acc[key]
        ? acc[key].push(this.afterActionApi(curr))
        : acc[key] = [this.afterActionApi(curr)];

      return acc;
    }, {});

    const reqsByPriority$ = Object.values(reqsDict).map(priority =>
      forkJoin(Array.isArray(priority) ? priority : [priority]));

    if (!reqsByPriority$?.length) {
      return of(null);
    }

    return forkJoin([
      concat(...reqsByPriority$),
    ]).pipe(
      tap(() => this.actionController.next()),
      tap(([res]) => {
        if (res?.some(r => !!r)) {
          this.sendRedirectUrl(id, partnerName, res.find((val: any) => val.status !== 200))?.pipe(
            filter(d => !!d),
            take(1),
            takeUntil(this.destroy$),
            tap((res: any) => window.location.href = res.redirectUrl),
          ).subscribe();
        }
      }),
    );
  }

  public sendRedirectUrl(businessId, integration, isError) {
    const redirectUriItem = localStorage.getItem('redirect_uri');
    const redirectUrl = redirectUriItem ? JSON.parse(redirectUriItem) : null;
    if (redirectUrl && !isError) {
      const url = `${this.envConfig.backend.commerceos}/api/onboarding/redirect-to-partner/business/${businessId}/integration/${integration}`;
      localStorage.setItem('redirect_uri', '');

      return this.http.get(url, {
        params: {
          redirectUrl: redirectUrl,
        },
      });
    }

    return of(null);
  }
}
