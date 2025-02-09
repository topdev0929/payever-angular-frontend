import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { Attribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, HostBinding, IterableDiffers, Inject } from '@angular/core';
import { CDK_TABLE_TEMPLATE, CdkTable } from '@angular/cdk/table';
import { Directionality } from '@angular/cdk/bidi';
import { isEqual } from 'lodash-es';

@Component({
  selector: 'pe-table, table[pe-table]',
  template: CDK_TABLE_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent<T> extends CdkTable<T> {
  @HostBinding('class.pe-table') hostClass = true;

  @Input('dataSource') set setDataSource(dataSource: T[]) {
    if (!this.dataSource) {
      this.dataSource = dataSource;
    }
    else {
      // We have to append items instead of just replacing whole array to avoid
      //  issue with jumping scroll when do infinity scroll
      const baseDataSource: T[] = (this.dataSource as T[]);
      let skip: number = 0;
      for (let i: number = 0; i < Math.min(baseDataSource.length, dataSource.length); i++) {
        if (isEqual(dataSource[i], this.dataSource[i])) {
          skip = i;
        } else {
          break;
        }
      }
      while (skip < baseDataSource.length) {
        baseDataSource.pop();
      }
      for (let i: number = baseDataSource.length; i < dataSource.length; i++) {
        baseDataSource.push(dataSource[i]);
      }
      this.renderRows();
    }
  }
/*
  constructor(protected _differs: IterableDiffers,
              protected _changeDetectorRef: ChangeDetectorRef,
              @Inject(_CoalescedStyleScheduler) _coalescedStyleScheduler: _CoalescedStyleScheduler,
              protected _elementRef: ElementRef,
              @Attribute('role') role: string,
              _dir: Directionality,
              @Inject(DOCUMENT) _document: any,
              private platform: Platform
  ) {
    super(_differs, _changeDetectorRef, _coalescedStyleScheduler, _elementRef, role, _dir, _document, platform);
  }*/
}
