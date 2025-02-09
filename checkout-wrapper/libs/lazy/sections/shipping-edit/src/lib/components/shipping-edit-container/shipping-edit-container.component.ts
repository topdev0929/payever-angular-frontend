import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  EventEmitter,
  Input,
  Output,
  OnInit,
  Injector,
} from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import {
  ShippingStateService, NormilizedShippingInterface, NormilizedShippingOptionInterface, ShippingOptionSaveDataInterface,
} from '@pe/checkout/shipping';
import { FlowInterface } from '@pe/checkout/types';
import { PeCurrencyPipe } from '@pe/checkout/utils';
import { WindowSizesService } from '@pe/checkout/window';
import { PeDestroyService } from '@pe/destroy';

type UpdateFlowCallback = (success: boolean) => void;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeCurrencyPipe, PeDestroyService],
  selector: 'checkout-shipping-edit-container',
  templateUrl: './shipping-edit-container.component.html',
  styleUrls: ['./shipping-edit-container.component.scss'],
})
/**
 * This is basically our root level container component. We cannot use root
 * element for 'container' role, because it mostly works as a bootstrap component
 */
export class ShippingEditContainerComponent implements OnInit {

  @Input() flow: FlowInterface = null;

  @Output() serviceReady: EventEmitter<boolean> = new EventEmitter();
  @Output() onLoading: EventEmitter<boolean> = new EventEmitter();
  @Output() onDisabled: EventEmitter<boolean> = new EventEmitter();
  @Output() onSubmitted: EventEmitter<boolean> = new EventEmitter();
  @Output() globalLoading: EventEmitter<boolean> = new EventEmitter();

  shippingsSubject: BehaviorSubject<NormilizedShippingInterface[]> = new BehaviorSubject(null);
  shippings$ = this.shippingsSubject.pipe(
    map(shippings =>
      shippings.map(shipping => ({
        ...shipping,
        options: shipping.options.reduce((acc, opt) => {
          acc.push({
            ...opt,
            deliveryTimeDaysTranslation: $localize `:@@checkout_shipping_edit.delivery_type_labels.delivers:\
              ${opt.deliveryTimeDays}:deliveryTimeDays:`,
            priceTranslation: $localize `:@@checkout_shipping_edit.delivery_type_labels.price:\
              ${this.currencyPipe.transform(opt.price, this.flow?.currency)}:price:`,
          });

          return acc;
        }, []),
      })),
    ),
  );

  isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  isMobile$: Observable<boolean> = null;
  error$: BehaviorSubject<string> = new BehaviorSubject(null);

  selectedIndex: number = null;
  selectedOptionIndex: number = null;

  private stateService = this.injector.get(ShippingStateService);
  private changeDetectorRef = this.injector.get(ChangeDetectorRef);
  private peWindowSizesService = this.injector.get(WindowSizesService);
  private currencyPipe = this.injector.get(PeCurrencyPipe);
  private destroy$ = this.injector.get(PeDestroyService);

  constructor(private injector: Injector) {
    this.isMobile$ = this.peWindowSizesService.isMobile$;
  }

  ngOnInit(): void {
    this.isLoadingSubject.next(true);
    this.stateService.getShippingsOnce(this.flow).pipe(takeUntil(this.destroy$)).subscribe(
      (data: NormilizedShippingInterface[]) => {
        if (this.selectedIndex === null) {
          this.selectedIndex = data.findIndex((shipping: NormilizedShippingInterface) => {
            if (shipping.options?.length) {
              this.selectedOptionIndex = shipping.options.findIndex(
                a => this.isSaved(this.flow, a.saveData));
            }

            return (this.selectedOptionIndex !== null && this.selectedOptionIndex >= 0) ||
                   (this.isSaved(this.flow, shipping.saveData));
          });
          if (this.selectedIndex === -1) {
            this.selectedIndex = 0;
            this.selectedOptionIndex = 0;
          }
          this.isLoadingSubject.next(false);
        }
        this.isLoadingSubject.next(false);
        this.shippingsSubject.next(data);
        this.onDisabled.emit(data.length === 0);
      },
      (err) => {
        const message = Object.values(err.errors || {}).length > 0
          ? Object.values(err.errors).join(', ')
          : (err.message || 'Unknown error');
        this.error$.next(message);
        this.isLoadingSubject.next(false);
      }
    );

    this.isLoading$.pipe(takeUntil(this.destroy$)).subscribe((isLoading) => {
      this.onLoading.emit(isLoading);
    });

    this.serviceReady.next(true);
    this.globalLoading.next(false);
  }

  onTriggerSubmit(callbackParam: UpdateFlowCallback = null): void {
    const callback = callbackParam || ((success: boolean) => this.onSubmitted.emit(success));

    const shippings: NormilizedShippingInterface[] = this.shippingsSubject.getValue();
    if (shippings.length > 0) {
      this.error$.next(null);
      this.isLoadingSubject.next(true);
      this.changeDetectorRef.detectChanges();

      const shipping: NormilizedShippingInterface = shippings[this.selectedIndex];
      const option: NormilizedShippingOptionInterface = shipping.options?.length
        ? shipping.options[this.selectedOptionIndex]
        : ({} as any);
      this.stateService.saveShipping(
        this.flow.channelSetId,
        shipping.shippingOrderId,
        shipping.integrationSubscriptionId,
        this.flow.id,
        { ...shipping.saveData, ...option.saveData }
      ).pipe(takeUntil(this.destroy$)).subscribe(
        () => {
          callback(true);
        },
        (err) => {
          this.error$.next(err.message || $localize `:@@checkout_shipping_edit.errors.unknown_error:`);
          this.isLoadingSubject.next(false);
        }
      );
    }
  }

  select(index: number): void {
    if (this.selectedIndex !== index) {
      this.selectedIndex = index;
      this.selectedOptionIndex = 0;
    }
  }

  private isSaved(flow: { [key: string]: any }, saveDataParam: ShippingOptionSaveDataInterface): boolean {
    return flow.shippingMethodName === saveDataParam.shippingMethodName
      && flow.shippingFee === saveDataParam.shippingFee;
  }
}
