import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder } from '@angular/forms';

import { PeDataGridFilterItems, PeDataGridSortByAction, PeDataGridSortByActionIcon, PeSearchItem } from '@pe/common';

import { OrderQuery } from '../interfaces';

@Injectable()
export class ContactsListService {

  sortBy$: BehaviorSubject<OrderQuery> = new BehaviorSubject(null);
  searchBy$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  filterBy$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  sortByActions: PeDataGridSortByAction[] = [
    {
      label: 'Name',
      callback: () => {
        this.sortBy$.next({ name: 'firstName', order: 'ASC' });
      },
      icon: PeDataGridSortByActionIcon.Name,
    },
    {
      label: 'Members',
      callback: () => {
        this.sortBy$.next({ name: 'firstName', order: 'DESC' });
      },
      icon: PeDataGridSortByActionIcon.NameContacts,
    },
    {
      label: 'Orders',
      callback: () => {
        this.sortBy$.next({ name: 'type', order: 'ASC' });
      },
      icon: PeDataGridSortByActionIcon.Ascending,
    },
    {
      label: 'Total spent',
      callback: () => {
        this.sortBy$.next({ name: 'type', order: 'DESC' });
      },
      icon: PeDataGridSortByActionIcon.Date,
    },
  ];

  searchItems = [];
  searchFilters: PeDataGridFilterItems[] = [
    {
      label: 'Name',
      value: 'firstName'
    },
    {
      label: 'Email',
      value: 'email'
    }
  ];

  typesFilterControl = this.fb.control([]);

  constructor(private fb: FormBuilder) {
    this.initFilters();
  }

  initFilters(): void {
    this.typesFilterControl.valueChanges.subscribe((filterValues: any) => {
      this.filterBy$.next(filterValues);
    });
  }

  getContactsQuery(): { filters: any, order: OrderQuery[] } {
    const rawFilters = this.filterBy$.value;
    let filters = {};
    const order = this.sortBy$.value ? [this.sortBy$.value] : [];
    // todo: handle searchFilters

    if (rawFilters?.length) {
      const values = rawFilters.map(({ name }) => name.toLowerCase());
      filters = { type: [{ values, type: '==' }] };
    }

    return { filters, order };
  }

  onSearchChanged(event: PeSearchItem): void {
    if (this.searchItems.find(item => item.filter === event.filter)) {
      const index = this.searchItems.findIndex(item => item.filter === event.filter);
      this.searchItems.splice(index, 1);
    }

    this.searchItems = [...this.searchItems, event];
    this.searchBy$.next(this.searchItems);
  }

  onSearchRemove(event): void {
    this.searchItems.splice(event, 1);
    this.searchBy$.next(this.searchItems);
  }

}
