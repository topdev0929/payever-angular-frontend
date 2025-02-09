import { Injectable, OnDestroy } from '@angular/core';
import { Actions, ofActionCompleted, ofActionSuccessful, Store } from '@ngxs/store';
import { merge, Subject } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { FlowStorage } from '@pe/checkout/storage';
import {
  AccordionPanelInterface,
  CheckoutUISettingsInterface,
  SectionType,
} from '@pe/checkout/types';
import { PaymentHelperService } from '@pe/checkout/utils';

import { CreateFinexpFlow, CreateFlow, FlowState, GetFlow, InitFlow } from '../flow';
import { GetSettings, InitSettings, SettingsState } from '../settings';

import * as StepActions from './steps.actions';
import { StepsState } from './steps.state';

@Injectable({
  providedIn: 'root',
})
export class StepsActionHandler implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private flowStorage: FlowStorage,
    private paymentHelperService: PaymentHelperService,
  ) {
    const saveStepsToStorage$ = this.actions$.pipe(
      ofActionCompleted(...Object.values(StepActions)),
      tap(() => {
        const steps = this.store.selectSnapshot(StepsState.allSteps);
        const flow = this.store.selectSnapshot(FlowState.flow);
        flow && this.flowStorage.setData(flow.id, 'steppermanagersteps', steps);
      }),
    );

    const initSteps$ = this.actions$.pipe(
      ofActionSuccessful(
        CreateFlow,
        CreateFinexpFlow,
        GetFlow,
        InitFlow,
        GetSettings,
        InitSettings,
      ),
    ).pipe(
      filter(() => this.store.selectSnapshot(FlowState.flow)
        && !!this.store.selectSnapshot(SettingsState.settings)),
      switchMap(() => {
        const flow = this.store.selectSnapshot(FlowState.flow);
        const settings = this.store.selectSnapshot(SettingsState.settings);
        const storedSteps = this.flowStorage.getData(flow.id, 'steppermanagersteps');

        this.paymentHelperService.openEmbedFinish$.next(false);

        return storedSteps
          ? this.store.dispatch(new StepActions.SetSteps(storedSteps))
          : (() => {
            const steps = this.filterSteps(settings);

            return this.store.dispatch(new StepActions.SetSteps(steps)).pipe(
              tap(() => {
                const nextStep = this.store.selectSnapshot(StepsState.markedNext);
                nextStep && this.store.dispatch(new StepActions.OpenStep(nextStep));
              }),
            );
          })();
      }),
    );

    merge(
      saveStepsToStorage$,
      initSteps$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private filterSteps(settings: CheckoutUISettingsInterface): AccordionPanelInterface[] {
    const sections = settings.sections.sort((a, b) => a.order - b.order);

    return sections.filter(section => section.enabled)
    .map((section, index) => {
      const steps = section.subsections.map(subsection =>
        section.code === SectionType.Order ? 'checkout-main-order' : subsection.code);
      steps.length = 1;

      return ({
        steps,
        name: section.code,
        excludedIntegrations: section?.excluded_integrations,
        allowedOnlyIntegrations: section?.allowed_only_integrations,
        options: section?.options ?? {},
        ...(!index && { opened: true }),
        ...(index && { disabled: true }),
        ...(!index && { step: steps[0] }),
      });
    });
  }
}
