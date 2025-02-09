import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
} from '@angular/core';
import { BehaviorSubject, Subject, Subscription, timer } from 'rxjs';
import { takeUntil, tap, delay } from 'rxjs/operators';

import { PeDestroyService } from '@pe/destroy';

import { RateAccordionDetailInterface } from '../../types';

const PANEL_WITH_OFFSET_HEIGHT_PX = 46 + 11;

@Component({
  selector: 'pe-choose-rate-accordion',
  templateUrl: 'kit-choose-rate-accordion.component.html',
  styleUrls: ['kit-choose-rate-accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class KitChooseRateAccordionComponent implements OnChanges {

  @Input('rates')
  set setRates(rates: RateAccordionDetailInterface[]) {
    if (JSON.stringify(this.rates) !== JSON.stringify(rates)) {
      this.rates = rates;
      if (this.initialRateId && !this.selectedRate) {
        const initial: RateAccordionDetailInterface = this.rates.find(rate => rate.id === this.initialRateId);
        this.chooseRate(initial || this.rates[0]);
      } else if (this.selectedRate) {
        const selected: RateAccordionDetailInterface = this.rates.find(rate => rate.id === this.selectedRate?.id);
        this.chooseRate(selected || this.rates[0]);
      }
      this.changeDetectorRef.detectChanges();
    }
  }

  @Input('isLoading')
  set setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
    this.changeDetectorRef.detectChanges();
  }

  @Input('initialRateId')
  set setInitialRateId(id: string) {
    if (id && !this.selectedRate) {
      this.initialRateId = id;
      this.chooseRate(this.rates.find(rate => rate.id === this.initialRateId));
      this.changeDetectorRef.detectChanges();
    }
  }

  @Input() doSelectRate: Subject<string> = null;

  @Output() rateSelected: EventEmitter<string> = new EventEmitter<string>();
  @Output() rateClicked: EventEmitter<string> = new EventEmitter<string>();
  @Output() panelOpened: EventEmitter<number> = new EventEmitter<number>();

  isLoading: boolean;
  initialRateId: string;
  rates: RateAccordionDetailInterface[] = null;
  selectedRate: RateAccordionDetailInterface = null;

  // We have to use this as hack to fix problem when <ng-content> sometimes not shown on toggle
  isShowContent$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isVisibleContent$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  showContentSub: Subscription = null;
  // We have to use this to avoid jumping on toggle down that happens because of isShowContent$
  lastContentHeight: {[key: string]: number} = null;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private destroy$: PeDestroyService,
  ) {}

  ngOnChanges(): void {
    if (this.rates && this.doSelectRate) {
      this.doSelectRate.pipe(
        tap((id: string) => {
          this.chooseRate(this.rates.find(rate => rate.id === id));
        }),
        takeUntil(this.destroy$),
      ).subscribe();
    }
  }

  chooseRate(rate: RateAccordionDetailInterface, forceSet = false): void {
    if (rate && (forceSet || this.selectedRate?.id !== rate.id)) {
      this.rateSelected.emit(rate.id);
      this.isShowContent$.next(!this.selectedRate);

      const index = this.rates.findIndex(d => d.id === rate.id);
      this.panelOpened.emit(index * PANEL_WITH_OFFSET_HEIGHT_PX);

      this.selectedRate = rate;
      if (this.showContentSub) {
        this.showContentSub.unsubscribe();
      }

      this.showContentSub = timer(100).pipe(
        tap(() => {
          this.isShowContent$.next(true);
        }),
        delay(100), // content should be displayed with a delay - this.isVisibleContent$.next(true)
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.isVisibleContent$.next(true);
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  onRateClicked(rate: RateAccordionDetailInterface): void {
    if (rate) {
      this.rateClicked.emit(rate.id);
    }
  }

}
