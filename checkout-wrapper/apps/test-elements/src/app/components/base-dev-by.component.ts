import { ChangeDetectorRef, Directive, Injector } from '@angular/core';
import { Subject } from 'rxjs';

import { ApiService } from '@pe/checkout/api';
import { CheckoutEventInterface } from '@pe/checkout/plugins';
import { BaseTimestampEvent as TimestampEvent, CheckoutStateParamsInterface } from '@pe/checkout/types';
import { SnackBarService } from '@pe/checkout/ui/snackbar';

import { ElementsManagerService } from '../services';

@Directive()
export abstract class BaseDevByComponent {

  disableLocaleDetection = false;
  params: CheckoutStateParamsInterface = null;
  checkoutHidden = false;

  defaultParams: CheckoutStateParamsInterface = {};

  updateFlow$: Subject<TimestampEvent> = new Subject();
  updateSettings$: Subject<TimestampEvent> = new Subject();
  openOrderStep$: Subject<TimestampEvent> = new Subject();
  updateSteps$: Subject<TimestampEvent> = new Subject();
  saveFlowToStorage$: Subject<TimestampEvent> = new Subject();

  lastEvents: CheckoutEventInterface[] = [];

  protected apiService: ApiService = this.injector.get(ApiService);
  protected snackBarService: SnackBarService = this.injector.get(SnackBarService);
  protected cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  protected elementsManagerService: ElementsManagerService = this.injector.get(ElementsManagerService);

  constructor(protected injector: Injector) {
  }

  protected showError(error: string): void {
    this.snackBarService.toggle(true, error || 'Unknows error', {
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }

  updateFlow(): void {
    this.updateFlow$.next(new TimestampEvent());
  }

  updateSettings(): void {
    this.updateSettings$.next(new TimestampEvent());
  }

  updateSteps(): void {
    this.updateSteps$.next(new TimestampEvent());
  }

  openOrderStep(): void {
    this.openOrderStep$.next(new TimestampEvent());
  }

  saveFlowToStorage(): void {
    this.saveFlowToStorage$.next(new TimestampEvent());
  }

  paramsChanged(params: CheckoutStateParamsInterface): void {
    this.params = params;
    this.cdr.detectChanges();
  }

  onLayoutShown(): void {
    // eslint-disable-next-line
    console.log('Layout shown!');
  }

  onEventEmitted(event: any): void {
    const e: CheckoutEventInterface = event?.detail ? event?.detail : null;
    this.lastEvents.unshift(e);
    this.lastEvents = this.lastEvents.slice(0, 6);
    // eslint-disable-next-line
    console.log('New event', e?.event, e?.value);
    this.cdr.detectChanges();
  }
}
