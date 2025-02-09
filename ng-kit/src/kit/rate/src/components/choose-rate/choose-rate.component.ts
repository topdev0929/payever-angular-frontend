import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  SimpleChanges,
  OnInit,
  OnDestroy,
  OnChanges
} from '@angular/core';
import { ReplaySubject, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isEqual, range } from 'lodash-es';

import { RateDetailInterface } from '../../rate.interface';

@Component({
  selector: 'pe-choose-rate',
  templateUrl: 'choose-rate.component.html',
  styleUrls: ['choose-rate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChooseRateComponent implements OnInit, OnDestroy, OnChanges {

  @Input() previewAsSingleLine: boolean = false;

  @Input() rates: RateDetailInterface[] = null;
  @Input() initialRateId: string = null;

  @Input('isLoading')
  set setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
    this.changeDetectorRef.detectChanges();
  }

  @Input('doSelectRate')
  doSelectRate: Subject<string> = null;

  @Input() maxDropDownHeight: number = 300;
  @Input() qaId: string = 'default';

  @Input() noRateSelectedText: string = null;

  @Output() ratesSelectOpened: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() rateSelected: EventEmitter<string> = new EventEmitter<string>();
  @Output() rateClicked: EventEmitter<string> = new EventEmitter<string>();

  isLoading: boolean;
  linesCount: number = 5;
  selectedRate: RateDetailInterface = null;
  isOpened$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject();

  constructor(
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.doSelectRate) {
      this.doSelectRate
        .pipe(takeUntil(this.destroyed$))
        .subscribe((id: string) => this.chooseRate(this.rates.find(rate => rate.id === id)));
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    // For very important reason we have that logic here instead of @Input('rates') set setRates(rates: RateDetailInterface[])
    // It's here because we need to have 'initialRateId' and 'rates' be updated to actual value in same time
    if (changes['rates'] && JSON.stringify(changes['rates'].previousValue) !== JSON.stringify(changes['rates'].currentValue)) {
      const selected: RateDetailInterface = this.rates.find(rate => this.selectedRate && rate.id === this.selectedRate.id);
      if (this.initialRateId && !selected) {
        const initial: RateDetailInterface = this.rates.find(rate => rate.id === this.initialRateId);
        this.chooseRate(initial || this.rates[0]);
      } else if (selected) {
        this.chooseRate(selected || this.rates[0]);
      }
      this.changeDetectorRef.detectChanges();
    }
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.hideRatesDropdown();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent): void {
    this.hideRatesDropdown();
  }

  chooseRate(rate: RateDetailInterface, forceSet: boolean = false): void {
    if (rate && (forceSet || !isEqual(this.selectedRate, rate))) {
      this.rateSelected.emit(rate.id);
      this.selectedRate = rate;
      this.isOpened$.next(false);
    }
  }

  onRateClicked(rate: RateDetailInterface): void {
    if (rate) {
      this.rateClicked.emit(rate.id);
    }
    this.chooseRate(rate, true);
  }

  openRatesDropdown(): void {
    if (this.isShowArrowDropdown()) {
      this.ratesSelectOpened.emit(true);
      this.isOpened$.next(true);
    }
  }

  hideRatesDropdown(): void {
    this.isOpened$.next(false);
  }

  range(): number[] {
    return range(this.linesCount);
  }

  isShowArrowDropdown(): boolean {
    return this.rates.length > 1 || !this.selectedRate;
  }

}
