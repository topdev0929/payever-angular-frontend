import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PeGridBaseColumnsService } from '../misc/services/base-columns.service';

export const MOBILE_ROW_HEIGHT = 91;
export const CHECKBOX_WIDTH = 42;

interface ColumnSizes {
  [key: number]: string; // key - column name
}

@Injectable({
  providedIn: 'root',
})
export class PeGridTableService extends PeGridBaseColumnsService {

  updateHeaderWidths$ = new Subject<any>();
  mobileRowHeight$ = new BehaviorSubject<number>(MOBILE_ROW_HEIGHT);

  showHeadInMobile = false;

  hasActionButton = false;
  hasPreviewButton = false;
  hasBadgeButton = false;
  isMobile = false;
  columnSizes: ColumnSizes = {};
  destroy$ = new Subject<void>();

  constructor() {
    super();
    this.displayedColumns$.pipe(
      tap((columns) => {
        this.columnSizes = columns.reduce((acc, item, index) => {
          let size: string = '150px';
          if (item?.widthCellForMobile) {
            size = item?.widthCellForMobile;
          } else if (item?.widthCellForMobile$) {
            size = `${item?.widthCellForMobile$.value}px`;
          }

          return {
            ...acc,
            [index]: size
          };
        }, {});
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  destroy(): void {
    this.hasActionButton = false;
    this.hasPreviewButton = false;
    this.hasBadgeButton = false;
    this.destroy$.next();
    this.destroy$.complete();
  }

}
