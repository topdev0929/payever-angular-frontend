import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Input,
  OnChanges,
  HostBinding,
  AfterViewInit,
  OnDestroy, ChangeDetectorRef,
} from '@angular/core';
import { ResizeSensor } from 'css-element-queries';

export interface DetailInteface {
  title: string;
  value: string;
}

/**
 * This component is copy pasted from @pe/checkout/payment-widgets-sdk
 * Had to copy because don't want to import whole SDK (for better build size)
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'selected-rate-details',
  templateUrl: './selected-rate-details.component.html',
  styleUrls: ['./selected-rate-details.component.scss'],
})
export class UISelectedRateDetailsComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() details: DetailInteface[] = [];
  @Input('numColumns') _numColumns = 2;

  @HostBinding('style.color') regularTextColor = '#333333';

  rows: DetailInteface[][] = [];
  isSmallSize = false;
  numColumns = 2;

  translations = {
    tableDescription: $localize `:@@santander-no.selected_rates_details.table.description:`,
  };

  private resizeSensor: ResizeSensor;
  private oldWidth: number = null;

  constructor(private element: ElementRef, private cdr: ChangeDetectorRef) {
  }

  ngAfterViewInit(): void {
    this.resizeSensor = new ResizeSensor(
      this.element.nativeElement,
      () => this.onResized(this.element.nativeElement.clientWidth));
  }

  ngOnDestroy(): void {
    if (this.resizeSensor) {
      this.resizeSensor.detach();
    }
  }

  ngOnChanges(): void {
    this.rows = this.details.reduce((acc, item, index) => {
      if (index % this.numColumns === 0) {
        acc.push([]);
      }
      acc.at(-1).push(item);

      return acc;
    }, []);
  }

  onResized(width: number): void {
    if (width !== this.oldWidth) {
      this.oldWidth = width;
      this.isSmallSize = width < 420;
      this.numColumns = this.isSmallSize ? 2 : this._numColumns;
      this.ngOnChanges();
      this.cdr.detectChanges();
    }
  }
}
