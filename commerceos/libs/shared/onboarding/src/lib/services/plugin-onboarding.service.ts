import { EventEmitter, Injectable, Injector, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, from, Observable, of, Subject } from 'rxjs';
import { concatMap, exhaustMap, skip, tap } from 'rxjs/operators';


import { BaseOnboardingService } from '../base-onboarding.class';
import { ActionDTO } from '../models';

import { OnboardingUtilsService } from './utils.service';

@Injectable({ providedIn: 'root' })
export class PluginOnboardingService extends BaseOnboardingService implements OnDestroy {
  public partnerAfterActions: EventEmitter<any> = new EventEmitter();
  public actionController = new Subject();

  private destroy$ = new Subject<void>();

  constructor(
    private onboardingUtilsService: OnboardingUtilsService,
    private route: ActivatedRoute,
    injector: Injector,
  ) {
    super(injector);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  runAfterPluginActions(actionsArray: ActionDTO[], defaultValues: any): Observable<unknown> {
    this.onboardingUtilsService.captureValue = defaultValues;

    const actions = this.sortActionsByOrderId(actionsArray);

    if (!actions?.length) {
      return of(null);
    }

    let skipCount = actions.length - 1;

    return from(actions).pipe(
      concatMap((actionData: ActionDTO) => {
        const payload = this.onboardingUtilsService.fillDataAction(actionData);

        if ('ifTrue' in payload && !payload.ifTrue) {
          return of(EMPTY);
        }

        return this.afterActionApi(payload).pipe(
          exhaustMap(data => this.onboardingUtilsService.captureActionResponse(payload, data))
        );
      }),
      skip(skipCount),
      tap((res) => {
        const redirectUrl = this.route.snapshot.queryParams['redirect_url'];
        const pluginHash = this.route.snapshot.queryParams['hash'];

        const url = new URL(this.onboardingUtilsService.parseUrl(redirectUrl, pluginHash));
        const searchParams = new URLSearchParams(url.search);
        Object.entries(res).forEach(([key, value]) => {
          searchParams.append(key, value);
        });

        this.onboardingUtilsService.clearCaptureValues();

        window.location.href = `${url.origin}${url.pathname}?${searchParams.toString()}`;
      }),
    );
  }
}
