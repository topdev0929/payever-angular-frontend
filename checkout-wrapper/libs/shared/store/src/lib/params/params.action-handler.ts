import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofActionCompleted, Store } from '@ngxs/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { filter, mapTo, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { FlowStorage } from '@pe/checkout/storage';
import { AccordionPanelInterface, CheckoutStateParamsInterface, FlowInterface, SectionType } from '@pe/checkout/types';
import { cloneDeep } from '@pe/checkout/utils/src';

import { FlowState } from '../flow';
import { SettingsState } from '../settings';
import { SetSteps, StepsState } from '../steps';

import { SetParams } from './params.actions';
import { ParamsState } from './params.state';
import {
  PANEL_REQUIREMENT_STEPS,
  PARAM_HANDLER,
  disableNextPanels,
  isPanelHiddenForChannel,
  openPanel,
} from './utils';

@Injectable({
  providedIn: 'root',
})
export class ParamsActionHandler implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(
    private actions$: Actions,
    private store: Store,
    private flowStorage: FlowStorage,
    private router: Router
  ) {
    this.actions$.pipe(
      ofActionCompleted(SetParams),
      tap(({ action: { payload } }) => {
        const flowId = this.store.selectSnapshot(FlowState.flowId);
        this.flowStorage.setData(flowId, 'params', payload);
      }),
      switchMap(() => this.applySettingsAndParamsToPanels()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applySettingsAndParamsToPanels(): Observable<void> {
    return combineLatest([
      this.store.select(FlowState.flow).pipe(
        filter(value => !!value),
      ),
      this.store.select(ParamsState.params).pipe(
        filter(value => !!value),
      ),
      this.store.select(SettingsState.settings).pipe(
        filter(value => !!value),
      ),
      this.store.select(StepsState.allSteps).pipe(
        filter(value => !!value),
      ),
    ]).pipe(
      take(1),
      tap(([flow, params, settings, steps]) => {
        let alteredSteps = cloneDeep(this.applyParams(steps, params, flow));

        if (settings.testingMode) {
          for (let i = alteredSteps.length - 1; i >= 0; i -= 1) {
            if (alteredSteps[i].name === SectionType.ChoosePayment) {
              break;
            }
            alteredSteps[i].hiddenByState = true;
          }
        }

        alteredSteps = alteredSteps.map((panel: AccordionPanelInterface) => ({
          ...panel,
          hiddenByState: PANEL_REQUIREMENT_STEPS[panel.name]
            ? PANEL_REQUIREMENT_STEPS[panel.name]?.shouldHide(flow, params, settings, alteredSteps)
            : isPanelHiddenForChannel(settings, panel.name),
          ...PANEL_REQUIREMENT_STEPS[panel.name]?.shouldSkip && {
            shouldSkip: PANEL_REQUIREMENT_STEPS[panel.name]?.shouldSkip(flow),
          },
        }));

        const visiblePanels = alteredSteps.filter(p => !p.hidden && !p.hiddenByState && !p.shouldSkip);
        if (!visiblePanels.some(s => s.opened)) {
          alteredSteps = this.openPanelAndDisableNext(alteredSteps, visiblePanels[0].name);
        }

        this.store.dispatch(new SetSteps(alteredSteps));
      }),
      mapTo(null),
    );
  }

  private applyParams(
    panels: AccordionPanelInterface[],
    params: CheckoutStateParamsInterface,
    flow: FlowInterface,
  ) {
    try {
      return Object.entries(params).reduce((acc, [key, value]) => {
        Object.entries(PARAM_HANDLER).forEach(([paramName, fn]) => {
          if (value && paramName === key) {
            acc = fn(acc, params, flow, value);
          }
        });

        return acc;
      }, [...panels]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);

      this.router.navigate(['/pay', 'static-finish', 'fail']);

      return [];
    }
  }


  private openPanelAndDisableNext(
    panels: AccordionPanelInterface[],
    type: SectionType,
  ): AccordionPanelInterface[] {
    return disableNextPanels(openPanel(panels, type), type);
  }
}
