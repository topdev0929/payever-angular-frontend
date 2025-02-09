import { Inject, Injectable, OnDestroy } from '@angular/core';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { Subject } from 'rxjs';
import { catchError, filter, takeUntil, tap } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PebIntegrationEventAction } from '@pe/builder/core';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

@Injectable()
export class PebIntegrationMessageHandler implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly componentSelector = 'pe-message-webcomponent';

  private isLoading = false;

  private readonly openMessage$ = this.actions$.pipe(
    ofActionDispatched(PebIntegrationEventAction),
    filter(({ payload }) => payload.action.connectorId === 'message-app'),
    tap(({ payload }) => this.openMessage()),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly env: PeAppEnv,
    @Inject(PE_ENV) public environment: EnvironmentConfigInterface,
  ) {
    this.openMessage$.pipe(
      takeUntil(this.destroy$),
      catchError((err) => {
        console.error(err);

        return err;
      })
    ).subscribe();
  }

  private openMessage(): void {
    if (this.isLoading) {
      return;
    }

    if (!customElements.get(this.componentSelector)) {
      this.isLoading = true;
      (window as any).business = this.env.business;
      const script = document.createElement('script');

      script.onload = () => {
        this.isLoading = false;
      };

      script.src = `${this.environment.custom.widgetsCdn}/message/widget.min.js`;
      document.head.appendChild(script);
    } else if (!document.querySelector(this.componentSelector)) {
      (window as any).insertMessageComponent();
    } else {
      (window as any).toggleButton();
    }
  }

  removeMessageComponent(): void {
    (window as any).removeMessageComponent?.();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
