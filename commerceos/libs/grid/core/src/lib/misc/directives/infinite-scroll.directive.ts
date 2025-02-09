import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { map, filter, takeUntil, pairwise, tap, debounceTime, startWith } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { PeGridService } from '../../grid.service';
import { PeGridQueryParamsService } from '../services/query-params.service';

@Directive({
  selector: 'div[pe-grid-infinite-scroll]',
  providers: [PeDestroyService],
})

export class InfiniteScrollDirective implements OnInit {
  @Input() wrapperRef: HTMLDivElement;
  @Input() isCopyingByDrag: boolean;

  @Input() infiniteScrollDistance = 10;
  @Output() scrolledToEnd = new EventEmitter<void>();

  private dataLength = 0;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.dataLength = 0;
  }

  constructor(
    private destroy$: PeDestroyService,
    private element: ElementRef,
    private gridQueryParamsService: PeGridQueryParamsService,
    private peGridService: PeGridService,
  ) {
  }

  ngOnInit(): void {
    this.initScrollListener();
    this.peGridService.items$.pipe(
      tap((items) => {
        if (items?.length <= this.dataLength) {
          this.dataLength = 0;
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  public scrollToEnd(): void {
    this.element.nativeElement.scrollTop = this.element.nativeElement.scrollHeight;
  }

  private initScrollListener(): void {
    if (this.element?.nativeElement) {
      fromEvent(this.element.nativeElement, 'scroll').pipe(
        startWith(false),
        debounceTime(200),
        map(() => {
          const isAtBottom = Math.abs(
            this.element.nativeElement.scrollHeight - this.element.nativeElement.scrollTop
            - this.element.nativeElement.clientHeight
          ) < this.infiniteScrollDistance;

          if (this.isCopyingByDrag) {
            isAtBottom &&
              this.scrollToEnd();
          }
      
          return {
            isAtBottom,
            scrollTop: this.element.nativeElement.scrollTop,
          };
        }),
        pairwise(),
        filter(([e1, e2]) => {
          if (e2.scrollTop < e1.scrollTop) {
            return false;
          }

          return e2.isAtBottom;
        }),
        tap(() => {
          const dataLength = this.peGridService.items.length;
          if (dataLength !== this.dataLength) {
            this.scrolledToEnd.emit();
            this.dataLength = this.peGridService.items.length;
          }
        }),
        takeUntil(this.destroy$)
      ).subscribe();
    }
  }
}
