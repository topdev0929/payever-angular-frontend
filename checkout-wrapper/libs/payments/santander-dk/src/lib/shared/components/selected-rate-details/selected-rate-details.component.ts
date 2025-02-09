import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Injector,
  Input,
  OnChanges,
  HostBinding,
  AfterViewInit,
  OnDestroy, ChangeDetectorRef,
} from '@angular/core';
import { ResizeSensor } from 'css-element-queries';

export interface DetailInterface {
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

  @Input() details: DetailInterface[] = [];
  @Input('numColumns') _numColumns = 3;

  @HostBinding('style.color') regularTextColor = '#333333';

  rows: DetailInterface[][] = [];
  isSmallSize = false;
  isExtraSmallSize = false;
  numColumns = 2;
  tableDescriptionTranslation = $localize `:@@santander-dk.selected_rate_details.table.description:`;

  private resizeSensor: ResizeSensor;
  private oldWidth: number = null;

  constructor(private element: ElementRef, private cdr: ChangeDetectorRef, injector: Injector) {
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
      this.isSmallSize = width < 720;
      this.isExtraSmallSize = width < 480;
      this.numColumns = this.getNumColumns();
      this.ngOnChanges();
      this.cdr.detectChanges();
    }
  }

  private getNumColumns(): number {
    if (this.isExtraSmallSize) {
      return 1;
    }
    if (this.isSmallSize) {
      return 2;
    }

    return this._numColumns;
  }
}
