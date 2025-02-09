import { CurrencyPipe } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  OnInit,
  Injector,
  ChangeDetectorRef,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  ShippingStateService, NormilizedShippingInterface, NormilizedShippingOptionInterface, ShippingOptionSaveDataInterface,
} from '@pe/checkout/shipping';
import { FlowState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencyPipe, PeDestroyService],
  selector: 'checkout-shipping-view-container',
  templateUrl: './shipping-view-container.component.html',
  styleUrls: ['./shipping-view-container.component.scss'],
})
/**
 * This is basically our root level container component. We cannot use root
 * element for 'container' role, because it mostly works as a bootstrap component
 */
export class ShippingViewContainerComponent implements OnInit {

  @SelectSnapshot(FlowState.flow) public flow: FlowInterface;

  @Output() serviceReady: EventEmitter<boolean> = new EventEmitter();

  shippingsSubject: BehaviorSubject<NormilizedShippingInterface[]> = new BehaviorSubject(null);
  shippings$: Observable<NormilizedShippingInterface[]> = this.shippingsSubject.asObservable();

  selectedIndex: number = null;
  selectedOptionIndex: number = null;
  deliversTranslation = $localize `:@@checkout_shipping_view.delivery_type_labels.delivers:${this.selectedOption.deliveryTimeDays}:deliveryTimeDays:`;

  private stateService = this.injector.get(ShippingStateService);
  private changeDetectorRef = this.injector.get(ChangeDetectorRef);
  private destroy$ = this.injector.get(PeDestroyService);

  constructor(private injector: Injector) {}

  ngOnInit(): void {
    this.stateService.getShippingsOnce(this.flow).pipe(
      takeUntil(this.destroy$),
    ).subscribe((data) => {
      this.selectedIndex = data.findIndex((shipping) => {
        if (shipping.options?.length) {
          this.selectedOptionIndex = shipping.options.findIndex(
            a => this.isSaved(this.flow, a.saveData));
        }

        return (this.selectedOptionIndex !== null && this.selectedOptionIndex >= 0) ||
               (this.isSaved(this.flow, shipping.saveData));
      });
      this.shippingsSubject.next(data);
      this.changeDetectorRef.detectChanges();
    });
    this.serviceReady.next(true);
  }

  get selected(): NormilizedShippingInterface {
    return typeof this.selectedIndex === 'number'
      && this.selectedIndex >= 0
        ? this.shippingsSubject.getValue()[this.selectedIndex]
        : null;
  }

  get selectedOption(): NormilizedShippingOptionInterface {
    return typeof this.selectedOptionIndex === 'number' && this.selected?.options
      ? this.selected.options[this.selectedOptionIndex]
      : null;
  }

  private isSaved(flow: { [key: string]: any }, saveDataParam: ShippingOptionSaveDataInterface): boolean {
    return flow.shippingMethodName === saveDataParam.shippingMethodName
      && flow.shippingFee === saveDataParam.shippingFee;
  }
}
