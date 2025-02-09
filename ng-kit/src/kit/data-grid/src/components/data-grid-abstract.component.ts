import { Directive, Injector, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WindowService, DeviceType } from '../../../window';

import { DataViewModeType } from '../interfaces';

@Directive()
export abstract class DataGridAbstractComponent<T> implements OnInit, OnDestroy {

  deviceType: typeof DeviceType = DeviceType;

  allItemsCount: number;
  items: T[];
  itemsPerRow: number = 4;
  pageSize: number = 10;

  abstract viewMode: DataViewModeType;

  protected windowService: WindowService = this.injector.get(WindowService);

  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject();

  constructor(private injector: Injector) {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.windowService.deviceType$.pipe(
      takeUntil(this.destroyed$)
    )
      .subscribe((deviceType: DeviceType) => {
        switch (deviceType) {
          case this.deviceType.Tablet:
            this.itemsPerRow = 2;
            break;
          case this.deviceType.Desktop:
            this.itemsPerRow = 4;
            break;
          case this.deviceType.DesktopLg:
            this.itemsPerRow = 5;
            break;
          default:
            this.itemsPerRow = 1;
        }
      });
  }

}
