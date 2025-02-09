import { Directive, OnInit, createNgModule } from '@angular/core';
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import { from, merge, Observable } from 'rxjs';
import { filter, first, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import {
  AbstractLazyLoadingComponent,
} from '@pe/checkout/core';
import type { FinishSelectorService } from '@pe/checkout/finish/selector';
import { TopLocationService } from '@pe/checkout/location';
import { FlowStorage } from '@pe/checkout/storage';
import { CheckoutState, ForceOpenFinishStep, ParamsState, StepsState } from '@pe/checkout/store';
import { AccordionPanelInterface, CheckoutStateParamsInterface } from '@pe/checkout/types';

@Directive()
export abstract class AbstractSelectorComponent
  extends AbstractLazyLoadingComponent
  implements OnInit {

  @Select(StepsState.steps) protected steps$!: Observable<AccordionPanelInterface[]>;

  @Select(StepsState.nextStep) protected nextStep$!: Observable<AccordionPanelInterface>;

  @Select(ParamsState.params) protected params$!: Observable<CheckoutStateParamsInterface>;

  @Select(CheckoutState.paymentComplete) private paymentComplete$: Observable<boolean>;

  protected flowStorage = this.injector.get(FlowStorage);
  protected store = this.injector.get(Store);
  private topLocationService = this.injector.get(TopLocationService);
  private actions$ = this.injector.get(Actions);

  ngOnInit(): void {
    super.ngOnInit();

    merge(
      this.actions$.pipe(ofActionDispatched(ForceOpenFinishStep)).pipe(
        map(() => true),
      ),
      this.paymentComplete$.pipe(
        filter(value => !!value && !this.topLocationService.isRedirecting),
        first(),
      )
    ).pipe(
      switchMap(() => this.loadFinishSelectorModule().pipe(
        switchMap(finishSelectorService => finishSelectorService.lazyLoadModule(
          this.injector,
          this.containerRef,
        )),
      )),
      tap(() => this.cdr.detectChanges()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  protected abstract loadLazyModuleAndComponent(): void;

  protected loadFinishSelectorModule(): Observable<FinishSelectorService> {
    return from(
      import('@pe/checkout/finish/selector')
        .then(({ FinishSelectorModule, FinishSelectorService }) => {
          const moduleRef = createNgModule(FinishSelectorModule, this.injector);

          return moduleRef.injector.get(FinishSelectorService);
        })
    );
  }
}
