import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { fromResizeObserver } from '@pe/checkout/utils/from-resize-observer';

import { DetailInterface } from './detail.interface';

@Component({
  selector: 'checkout-sdk-santander-de-selected-rate-details',
  templateUrl: 'santander-de-selected-rate-details.component.html',
  styleUrls: ['santander-de-selected-rate-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SantanderDeSelectedRateDetailsComponent implements OnInit {

  @ViewChild('container', { static: true })
  private readonly containerRef!: ElementRef<HTMLDivElement>;

  @Input() isManyColumnsDisabled = false; // allow more than 2 columns per row

  @Input() details: DetailInterface[];

  @Input() noMarginBottom = false;

  valueWrapClass$: Observable<string>;

  ngOnInit(): void {
    this.valueWrapClass$ = fromResizeObserver(this.containerRef.nativeElement).pipe(
      map(({ contentRect }) =>
        contentRect.width > 600 && !this.isManyColumnsDisabled
          ? 'col-xs-4'
          : 'col-xs-6'
      ),
      distinctUntilChanged(),
    );
  }
}
