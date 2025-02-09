import {  Injectable } from "@angular/core";
import { SelectSnapshot } from "@ngxs-labs/select-snapshot";

import { PeFilterChange } from "@pe/grid/shared";
import { BusinessState } from "@pe/user";

import { SearchFiltersInterface, SortInterface } from "../interfaces";

@Injectable()
export class PaymentLinksFilterService {
  @SelectSnapshot(BusinessState.businessUuid) businessId: string;

  private searchItemsData: PeFilterChange[] = null;
  private filterConfigurationData: SearchFiltersInterface = null;
  private _sortData: SortInterface = {
    orderBy: '',
    direction: '',
  };

  get sortData(){
    return this._sortData;
  }

  onSortAction(orderBy: string, direction: string): void {
    this._sortData = {
      orderBy: orderBy === 'customer_name' ? 'customer_name.keyword' : orderBy,
      direction,
    };
  }

  set searchItems(items: PeFilterChange[]) {
    this.searchItemsData = items;
    try {
      sessionStorage?.setItem(`pe.payment-links.${this.businessId}.filters`, JSON.stringify(items));
    } catch (e) {}
  }


  get searchItems(): PeFilterChange[] {
    if (!this.searchItemsData) {
      try {
        this.searchItemsData = JSON.parse(sessionStorage?.getItem(`pe.payment-links.${this.businessId}.filters`)) || [];
      } catch (e) {
        this.searchItemsData = [];
      }
    }

    return this.searchItemsData;
  }


  set filterConfiguration(items: SearchFiltersInterface) {
    this.filterConfigurationData = items;
    try {
      sessionStorage?.setItem(`pe.payment-links.${this.businessId}.config`, JSON.stringify(items));
    } catch (e) {}
  }

  get filterConfiguration(): SearchFiltersInterface {
    if (!this.filterConfigurationData) {
      try {
        this.filterConfigurationData = JSON.parse(sessionStorage?.getItem(`pe.payment-links.${this.businessId}.config`)) || [];
      } catch (e) {
        this.filterConfigurationData = null;
      }
    }

    return this.filterConfigurationData;
  }

  onFiltersChange(filterItems: PeFilterChange[]): void {
    this.searchItems = filterItems;
    this.filterConfiguration = {};
    this.searchItems.forEach((a) => {
      this.filterConfiguration[a.filter] = [];
    });

    this.searchItems.forEach((a) => {
      let existing = this.filterConfiguration[a.filter].find(b => b.condition === a.contain);
      if (!existing) {
        existing = {
          condition: a.contain,
          value: [a.search],
        };
        this.filterConfiguration[a.filter].push(existing);
      } else {
        existing.value.push(a.search);
      }
    });
  }
}
