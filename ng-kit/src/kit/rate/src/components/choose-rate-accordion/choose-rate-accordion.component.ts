import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  OnInit,
  ViewChild
} from '@angular/core';
import { BehaviorSubject, Subject, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isEqual } from 'lodash-es';

import { AbstractComponent } from '../../../../common';
import { RateAccordionDetailInterface } from '../../rate.interface';

const PANEL_WITH_OFFSET_HEIGHT_PX = 46 + 11;

@Component({
  selector: 'pe-choose-rate-accordion',
  templateUrl: 'choose-rate-accordion.component.html',
  styleUrls: ['choose-rate-accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChooseRateAccordionComponent extends AbstractComponent implements OnInit {

  @Input('rates')
  set setRates(rates: RateAccordionDetailInterface[]) {
    if (JSON.stringify(this.rates) !== JSON.stringify(rates)) {
      this.rates = rates;
      if (this.initialRateId && !this.selectedRate) {
        const initial: RateAccordionDetailInterface = this.rates.find(rate => rate.id === this.initialRateId);
        this.chooseRate(initial || this.rates[0]);
      } else if (this.selectedRate) {
        const selected: RateAccordionDetailInterface = this.rates.find(rate => rate.id === this.selectedRate.id);
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
  @Input('doSelectRate') doSelectRate: Subject<string> = null;
  @ViewChild('contentElem') contentElem: ElementRef<any>;

  @Output() rateSelected: EventEmitter<string> = new EventEmitter<string>();
  @Output() rateClicked: EventEmitter<string> = new EventEmitter<string>();
  @Output() panelOpened: EventEmitter<number> = new EventEmitter<number>();

  isLoading: boolean;
  initialRateId: string;
  rates: RateAccordionDetailInterface[] = null;
  selectedRate: RateAccordionDetailInterface = null;

  // We have to use this as hack to fix problem when <ng-content> sometimes not shown on toggle
  isShowContent$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showContentSub: Subscription = null;
  // We have to use this to avoid jumping on toggle down that happens because of isShowContent$
  lastContentHeight: number = 0;

  constructor(
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.doSelectRate) {
      this.doSelectRate
        .pipe(takeUntil(this.destroyed$))
        .subscribe((id: string) => this.chooseRate(this.rates.find(rate => rate.id === id)));
    }
  }

  chooseRate(rate: RateAccordionDetailInterface, forceSet: boolean = false): void {
    if (rate && (forceSet || !isEqual(this.selectedRate, rate))) {
      this.rateSelected.emit(rate.id);
      this.isShowContent$.next(!this.selectedRate);

      const index = this.rates.findIndex(d => d.id === rate.id);
      this.panelOpened.emit(index * PANEL_WITH_OFFSET_HEIGHT_PX);

      this.selectedRate = rate;
      if (this.showContentSub) {
        this.showContentSub.unsubscribe();
      }
      this.showContentSub = timer(1).subscribe(() => {
        this.isShowContent$.next(true);
        this.changeDetectorRef.detectChanges();
        const height = this.contentElem ? this.contentElem.nativeElement.offsetHeight : 0;
        this.lastContentHeight = Math.max(this.lastContentHeight, height);
      });
    }
  }

  onRateClicked(rate: RateAccordionDetailInterface): void {
    if (rate) {
      this.rateClicked.emit(rate.id);
    }
  }

}
