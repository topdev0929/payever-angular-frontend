import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  createNgModule,
} from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { delay, filter, map, takeUntil, take } from 'rxjs/operators';

import { LoaderService } from '@pe/checkout/core/loader';
import type { ShippingEditContainerComponent } from '@pe/checkout/sections/shipping-edit';
import { DisableStepsAfter, GetFlow, OpenNextStep } from '@pe/checkout/store';
import { SectionType, TimestampEvent } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { AbstractSelectorComponent } from '../abstract';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-shipping',
  styleUrls: ['./shipping.component.scss'],
  templateUrl: 'shipping.component.html',
  providers: [PeDestroyService],
})
export class ShippingComponent extends AbstractSelectorComponent implements OnInit {

  submit$: Subject<TimestampEvent> = new Subject();

  isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  isFetchingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isFetching$: Observable<boolean> = this.isFetchingSubject.asObservable();

  isDisabledSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isDisabled$: Observable<boolean> = this.isDisabledSubject.asObservable();

  isCartNotEmpty$: Observable<boolean> = null;


  private instance: ShippingEditContainerComponent = null;
  private subs: Subscription[] = [];

  private loaderService: LoaderService = this.injector.get(LoaderService);

  ngOnInit(): void {
    // We have to additionally request flow here to avoid issie in builder
    // Issue happens when builder pathches flow with cart item
    // but flow in not fully loaded to receive events (but already fetched flow)
    this.isLoading$.pipe(delay(1), takeUntil(this.destroy$)).subscribe(() => this.cdr.detectChanges());
    this.isFetching$.pipe(delay(1), takeUntil(this.destroy$)).subscribe(() => this.cdr.detectChanges());
  }

  initFlow(): void {
    super.initFlow();

    this.isCartNotEmpty$ = this.flow$.pipe(
      filter(d => !!d),
      takeUntil(this.destroy$),
      map(flow => (flow.cart || []).some(cartItem => cartItem.quantity > 0)),
    );
  }

  onLoading(loading: boolean): void {
    this.isLoadingSubject.next(!!loading);
  }

  serviceReadyChange(event: CustomEvent): void {
    // Don't remove this method !!!
  }

  onContinue(): void {
    if (!this.isLoadingSubject.getValue() && !this.isFetchingSubject.getValue()) {
      this.submit$.next(new TimestampEvent());
    }
  }

  onSubmitted(): void {
    this.flow$.pipe(take(1)).subscribe((flow) => {
      this.isFetchingSubject.next(true);
      this.store.dispatch(new GetFlow(this.flowId)).subscribe(
        () => {
          this.isFetchingSubject.next(false);
          this.store.dispatch(new DisableStepsAfter(SectionType.Order));
          this.store.dispatch(new OpenNextStep());
        },
        () => {
          this.isFetchingSubject.next(false);
        }
      );
    });
  }

  onDisabled(isDisabled: boolean): void {
    this.isDisabledSubject.next(isDisabled);
  }

  protected initInputsOutputs(): void {
    if (this.instance) {
      this.flow$.pipe(take(1)).subscribe((flow) => {
        this.instance.flow = flow;
      });
      this.subs?.forEach(s => s?.unsubscribe());
      this.subs = [
        this.submit$.pipe(takeUntil(this.destroy$)).subscribe(() => this.instance.onTriggerSubmit()),
        this.instance.onLoading.pipe(
          takeUntil(this.destroy$),
        ).subscribe(value => this.onLoading(value)),
        this.instance.onSubmitted.pipe(
          takeUntil(this.destroy$),
        ).subscribe(value => this.onSubmitted()),
        this.instance.onDisabled.pipe(
          takeUntil(this.destroy$),
        ).subscribe(value => this.onDisabled(value)),
        this.instance.globalLoading.pipe(
          takeUntil(this.destroy$),
        ).subscribe(value => this.loaderService.loaderGlobal = value),
      ];
    }
  }

  protected loadLazyModuleAndComponent(): void {

    import('@pe/checkout/sections/shipping-edit').then(({ ShippingEditModule }) => {
      // Create a moduleRef, resolve an entry component, create the component
      const moduleRef = createNgModule(ShippingEditModule, this.injector);
      const componentType = moduleRef.instance.resolveShippingEditContainerComponent();
      this.isAllReady$.subscribe(() => {
        const instanceData = this.containerRef.createComponent(componentType, {
          index: 0,
          injector: moduleRef.injector,
        });

        this.instance = instanceData.instance;
        this.initInputsOutputs();


        this.cdr.detectChanges();
      });
    });
  }
}
