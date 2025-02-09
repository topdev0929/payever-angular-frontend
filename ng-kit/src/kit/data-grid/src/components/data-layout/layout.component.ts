import { Component, EventEmitter, Input, HostBinding, Output, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DataViewModeType } from '../../interfaces';
import { peVariables } from '../../../../pe-variables';
import { WindowService } from '../../../../window';

@Component({
  selector: 'pe-data-grid-layout',
  templateUrl: 'layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataGridLayoutComponent implements OnInit, OnDestroy {

  dataViewMode: typeof DataViewModeType = DataViewModeType;

  // We apply mouse horiz scroll only for non-touch devices for type list
  @ViewChild('scrollHorizElem', { read: ElementRef }) scrollHorizElem: ElementRef<HTMLElement>;

  @Input() loading: boolean = false;
  @Input() itemsEmpty: boolean = false;
  @Input() filtersPanelActive: boolean = false;
  @Input() viewMode: DataViewModeType = this.dataViewMode.List;
  @Input() infinite: boolean;
  @Input() hasMore: boolean;
  @Input() noPagination: boolean;
  @Input() displayFooter: boolean;
  @Input() infiniteScrollSensitivityPx: number = 1000;

  @Output() loadMore: EventEmitter<void> = new EventEmitter<void>();
  @HostBinding('class.data-grid') hostClass: boolean = true;

  spinerStrokeWidth: number = peVariables.toNumber('spinnerStrokeWidth');
  spinerDiameter: number = peVariables.toNumber('spinnerStrokeXs');
  isMobile: boolean;
  scrollEndDistance: number;

  private isScrolling: boolean = false;
  private startScrollX: number = 0;
  private destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private windowService: WindowService,
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.windowService.isMobile$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(isMobile => {
        this.isMobile = isMobile;
        if (this.infinite === undefined) {
          this.infinite = isMobile;
        }
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  isTouchDevice(): boolean {
    return this.windowService.isTouchDevice();
  }

  onScrollEnd(): void {
    if (this.infinite && this.hasMore) {
      this.loadMore.emit();
    }
  }

  onPan(data: WheelEvent): void {
    this.scrollHorizElem.nativeElement.scrollLeft = this.startScrollX - data.deltaX;
  }

  onPanStart(): void {
    this.isScrolling = true;
  }

  onPanEnd(): void {
    this.startScrollX = this.scrollHorizElem.nativeElement.scrollLeft;
    this.isScrolling = false;
  }

}
