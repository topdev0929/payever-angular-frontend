import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ListDataModel } from './interfaces';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'peb-list-info',
  templateUrl: './list-info.html',
  styleUrls: ['./list-info.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PebListInfoComponent implements OnInit{
  @Input() listData: Observable<ListDataModel[]> | ListDataModel[];
  @Input() header: string = null;
  items:  Observable<ListDataModel[]>;

  ngOnInit() {
    if (Array.isArray(this.listData)) {
      this.items = of(this.listData);
    } else {
      this.items = this.listData;
    }
  }
}
