import { CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnInit,
  OnDestroy,
  OnChanges,
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ReplaySubject, BehaviorSubject, Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RatesStateService } from '@pe/checkout/api';
import { CustomElementService } from '@pe/checkout/utils';

import { RateDetailInterface, RateToggleExtraDurationInterface } from '../../types';

@Component({
  selector: 'pe-choose-rate',
  templateUrl: 'kit-choose-rate.component.html',
  styleUrls: ['kit-choose-rate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KitChooseRateComponent implements OnInit, OnDestroy, OnChanges {

  @Input() previewAsSingleLine = false;

  @Input() rates: RateDetailInterface[] = null;
  @Input() initialRateId: string = null;

  @Input() isLoading: boolean;
  @Input() selectedExtraDurations: number[];

  @Input() doSelectRate: Subject<string> = null;

  @Input() maxDropDownHeight = 300;
  @Input() qaId = 'default';

  @Input() noRateSelectedText: string = null;
  @Input() hasInfoButton = false;

  @Output() ratesSelectOpened = new EventEmitter<boolean>();
  @Output() toggleExtraDuration = new EventEmitter<RateToggleExtraDurationInterface>();
  @Output() rateSelected = new EventEmitter<string>();
  @Output() rateClicked = new EventEmitter<string>();
  @Output() infoButtonClicked = new EventEmitter<void>();

  linesCount = 5;
  selectedRate: RateDetailInterface = null;
  isOpened$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  translations = {
    noRateSelected: $localize `:@@checkout_sdk.rate.no_rate_selected:`,
  };

  private positions: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: -50,
    },
  ];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject();

  constructor(
    public ratesStateService: RatesStateService,
    protected customElementService: CustomElementService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['arrow-left-16', 'settings-info-48'],
      null,
      this.customElementService.shadowRoot
    );
  }

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

  ngOnChanges(changes: SimpleChanges): void {
    // For very important reason we have that logic here instead of
    // @Input('rates') set setRates(rates: RateDetailInterface[])
    // It's here because we need to have 'initialRateId' and 'rates' be updated to actual value in same time
    if (changes.rates
      && JSON.stringify(changes.rates.previousValue) !== JSON.stringify(changes.rates.currentValue)
      ) {
      const selected = this.rates.find(rate => this.selectedRate && rate.id === this.selectedRate.id);
      if (!selected) {
        const initial: RateDetailInterface = this.rates.find(rate => rate.id === this.initialRateId);
        this.chooseRate(initial || this.rates[0]);
      } else {
        this.chooseRate(selected);
      }

      this.changeDetectorRef.detectChanges();
    }
  }

  getOverlayWidth(
    overlayOrigin: CdkOverlayOrigin,
  ): string | number {
    return overlayOrigin.elementRef.nativeElement.getBoundingClientRect().width;
  }

  getOverlayPositions(
    overlayOrigin: CdkOverlayOrigin,
  ): ConnectedPosition[] {
    return this.positions.map(position => ({
      ...position,
      offsetY: -overlayOrigin.elementRef.nativeElement.getBoundingClientRect().height,
    }));
  }

  chooseRate(rate: RateDetailInterface, forceSet = false): void {
    if (rate && (forceSet || this.selectedRate?.id !== rate.id || this.selectedRate?.title !== rate.title)) {
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

  onInfoButtonClicked(): void {
    this.infoButtonClicked.emit();
    timer(1).subscribe(() => this.close());
  }

  openRatesDropdown(): void {
    if (this.isShowArrowDropdown()) {
      this.ratesSelectOpened.emit(true);
      this.isOpened$.next(true);
    }
  }

  close(): void {
    this.isOpened$.next(false);
  }

  range(): number[] {
    return Array(this.linesCount).fill(0).map((_, idx) => idx);
  }

  isShowArrowDropdown(): boolean {
    return this.rates?.length > 1 || !this.selectedRate;
  }

  isSelectedExtraDuration(duration: string): boolean {
    return this.selectedExtraDurations.includes(Number(duration));
  }

  onSelectExtraDuration(e: MatCheckboxChange) {
    this.toggleExtraDuration.emit({
      duration: Number(e.source.value),
      checked: e.checked,
    });
  }
}
