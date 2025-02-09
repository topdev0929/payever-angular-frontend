import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output,
  OnInit,
  createNgModule,
} from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, throwError } from 'rxjs';
import { delay, filter, map, takeUntil, take, tap, catchError } from 'rxjs/operators';


import { LoaderService } from '@pe/checkout/core/loader';
import type { CartEditContainerComponent } from '@pe/checkout/sections/cart-edit';
import { DisableStepsAfter, GetFlow } from '@pe/checkout/store';
import { FlowInterface, SectionType, TimestampEvent } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { AbstractSelectorComponent } from '../../../abstract';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-order-edit',
  styleUrls: ['./order-edit.component.scss'],
  templateUrl: 'order-edit.component.html',
  providers: [PeDestroyService],
})
export class OrderEditComponent extends AbstractSelectorComponent implements OnInit {

  @Input() submitText: string;
  @Output() submitSuccess: EventEmitter<FlowInterface> = new EventEmitter();
  @Output() loading: EventEmitter<boolean> = new EventEmitter();

  submit$: Subject<TimestampEvent> = new Subject();

  isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  isFetchingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isFetching$: Observable<boolean> = this.isFetchingSubject.asObservable();

  isCartNotEmpty$: Observable<boolean> = null;

  inititalFlow: FlowInterface;

  fallbackText = $localize `:@@amount.action.continue:`;

  protected i18nDomains: string[] = ['checkout-cart-app'];

  private instance: CartEditContainerComponent = null;
  private subs: Subscription[] = [];

  private loaderService: LoaderService = this.injector.get(LoaderService);

  ngOnInit(): void {
    super.ngOnInit();

    // We have to additionally request flow here to avoid issie in builder
    // Issue happens when builder pathches flow with cart item
    // but flow in not fully loaded to receive events (but already fetched flow)
    this.isLoading$.pipe(delay(1), takeUntil(this.destroy$)).subscribe(() => this.cdr.detectChanges());
    this.isFetching$.pipe(delay(1), takeUntil(this.destroy$)).subscribe(() => this.cdr.detectChanges());
  }

  get isUseInventory(): boolean {
    const flow = this.inititalFlow;

    return !(flow.apiCall || flow.apiCall.id) || flow?.forceLegacyUseInventory;
  }

  initFlow(): void {
    super.initFlow();

    this.flow$.pipe(filter(d => !!d), take(1), takeUntil(this.destroy$)).subscribe((flow: FlowInterface) => {
      this.inititalFlow = flow;
    });

    this.isCartNotEmpty$ = this.flow$.pipe(
      filter(d => !!d),
      map((flow: FlowInterface) => (flow.cart || []).some(cartItem => cartItem.quantity > 0)),
      takeUntil(this.destroy$),
    );
  }

  onLoading(loading: boolean): void {
    this.loading.emit(true);
    this.isLoadingSubject.next(!!loading);
    if (loading) {
      // We have to disable next steps to prevent case when card is saved
      // but not possible to reserve saved items
      this.store.dispatch(new DisableStepsAfter(SectionType.Order));
    }
  }

  onServiceReadyChange(event: CustomEvent): void {
    // Don't remove this method !!!
  }

  onContinue(): void {
    if (!this.isLoadingSubject.getValue() && !this.isFetchingSubject.getValue()) {
      this.submit$.next(new TimestampEvent());
    }
  }

  onSubmitted(success: boolean): void {
    if (success) {
      this.flow$.pipe(take(1)).subscribe((flow) => {
        this.isFetchingSubject.next(true);
        this.store.dispatch(new GetFlow(this.flowId)).pipe(
          tap(() => {
            this.isFetchingSubject.next(false);
            this.submitSuccess.next(flow);
          }),
          catchError((err) => {
            this.isFetchingSubject.next(false);

            return throwError(err);
          }),
        ).subscribe();
      });
    }
  }

  protected initInputsOutputs(): void {
    if (this.instance) {
      this.instance.isUseInventory = this.isUseInventory;
      this.instance.isProductsRefreshDisabled = !this.isUseInventory;
      this.instance.flowId = this.flowId;
      this.subs?.forEach(s => s?.unsubscribe());
      this.subs = [
        this.submit$.pipe(
          takeUntil(this.destroy$),
        ).subscribe(() => this.instance.onTriggerSubmit()),
        this.instance.onLoading.pipe(
          takeUntil(this.destroy$),
        ).subscribe(value => this.onLoading(value)),
        this.instance.onSubmitted.pipe(
          takeUntil(this.destroy$),
        ).subscribe(value => this.onSubmitted(value)),
        this.instance.globalLoading.pipe(
          takeUntil(this.destroy$),
        ).subscribe(value => this.loaderService.loaderGlobal = value),
      ];
    }
  }

  protected loadLazyModuleAndComponent(): void {

    import('@pe/checkout/sections/cart-edit').then(({ CartEditModule }) => {
      // Create a moduleRef, resolve an entry component, create the component
      const moduleRef = createNgModule(CartEditModule, this.injector);
      const componentType = moduleRef.instance.resolveCartEditContainerComponent();
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
