import { Injector, ChangeDetectorRef, Directive, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, takeUntil } from 'rxjs/operators';

import { FlowState, ParamsState, SettingsState } from '@pe/checkout/store';
import {
  CheckoutStateParamsInterface,
  FlowInterface,
  PaymentOptionInterface,
} from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { noShippingAddress } from '../settings';

@Directive()
export abstract class AbstractFlowIdComponent implements OnChanges, OnInit {

  @Select(ParamsState.params) protected params$!: Observable<CheckoutStateParamsInterface>;

  @Select(FlowState.flowId) public flowId$!: Observable<string>;

  @SelectSnapshot(FlowState.flow) public flow: FlowInterface;

  @SelectSnapshot(FlowState.flowId) public flowId: string;

  noShippingAddress$: Observable<boolean>;

  public cdr = this.injector.get(ChangeDetectorRef);
  protected store = this.injector.get(Store);
  protected destroy$ = this.injector.get(PeDestroyService);

  flow$ = this.store.select(FlowState.flow).pipe(
    filter(value => !!value),
    takeUntil(this.destroy$),
    shareReplay(1),
  );

  settings$ = this.store.select(SettingsState.settings).pipe(
    filter(d => !!d),
    takeUntil(this.destroy$),
    shareReplay(1),
  );

  constructor(protected injector: Injector) {}

  ngOnInit(): void {
    if (this.flowId) {
      this.initFlow();
      this.cdr.markForCheck();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.flowId?.currentValue
      && changes.flowId?.previousValue
      && changes.flowId?.previousValue !== changes.flowId.currentValue
    ) {
      this.initFlow();
      this.cdr.markForCheck();
    }
  }

  trackById(idx: number, obj: any) {
    return obj.id;
  }

  protected pickParam$<T>(
    destroyed$: Subject<void>,
    callback: (params: CheckoutStateParamsInterface) => T,
  ): Observable<T> {
    return this.store.select(ParamsState.params).pipe(
      filter(d => !!d),
      map(callback),
      distinctUntilChanged(),
      takeUntil(destroyed$),
    );
  }

  protected initFlow(): void {
    this.noShippingAddress$ = this.flow$.pipe(map((flow: FlowInterface) => {
      const option: PaymentOptionInterface = flow?.paymentOptions && flow?.paymentOptions.length === 1
        ? flow?.paymentOptions[0]
        : null;

      return Boolean(option && noShippingAddress.indexOf(option.paymentMethod) >= 0);
    }));
  }
}
