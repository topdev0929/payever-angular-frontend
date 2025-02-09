import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { PeFilterContainsEnum, PeSearchItem } from '@pe/common';

import { groupQueryParam } from '../../../../misc/constants';
import { GridSortingFieldsEnum } from '../../../../misc/enum';
import { BusinessEmployeeInterface } from '../../../../misc/interfaces';
import { navbarFilterKeysEnum } from '../../enums/navbar-filter-keys.enum';
import { SidebarFilterInterface } from '../../interfaces';
import { IGroupsInterface } from '../../interfaces/employee-group.interface';
import { EmployeesGridItemInterface } from '../../interfaces/employees-grid-item.interface';
import { PebEmployeesState, PeEmployeesActions } from '../../state/employees';
import {
  PebEmployeesGridSortHelperService,
} from '../employee-grid-sorting-helper/employees-grid-sorting-helper.service';
import { PebGridDataConverterService } from '../grid-data-converter/peb-grid-data-converter.service';

@Injectable()
export class PebBusinessEmployeesStorageService {
  totalEmployees: number = null;
  // employees and grid items
  private employees: BusinessEmployeeInterface[] = [];
  private _groups: IGroupsInterface;

  // filters
  private sidebarFilter: SidebarFilterInterface;
  private navbarFilters: PeSearchItem[] = [];

  private initialized = false;

  set isEmployeesLoaded(value) {
    this.initialized = value;
  }

  get isEmployeesLoaded(): boolean {
    return this.initialized;
  }

  set groups(groups) {
    this._groups = groups;
  }

  get groups() {
    return this._groups;
  }

  constructor(
    private dataConverter: PebGridDataConverterService,
    private sortHelper: PebEmployeesGridSortHelperService,
    private store: Store,
  ) { }

  setSidebarFilter(filter: SidebarFilterInterface = null) {
    this.sidebarFilter = filter;
  }

  getFilteredGridItems(): EmployeesGridItemInterface[] {
    let filteredGridItems = this.store.selectSnapshot(PebEmployeesState.allGridItems);

    if (
      this.sidebarFilter.param !== groupQueryParam
      && this.sidebarFilter.param
      && this.sidebarFilter.category
    ) {
      filteredGridItems = filteredGridItems.filter(
        ({ data }) => data[this.sidebarFilter.param] && data[this.sidebarFilter.param] === this.sidebarFilter.category,
      );
    }

    // filter by group
    if (this.sidebarFilter.param === groupQueryParam && this.sidebarFilter.category) {
      const employeesIds = this.groups?.data.find(group => group.name === this.sidebarFilter.category)?.employees;
      filteredGridItems = filteredGridItems.filter(
        item => employeesIds?.find(id => id === item.id),
      );
    }

    // filter by navbar filters
    this.navbarFilters.forEach((navbarFilter) => {
      filteredGridItems = this.filterItemsByNavbarFilter(filteredGridItems, navbarFilter);
    });

    return filteredGridItems;
  }

  setEmployeesList(allEmployees: BusinessEmployeeInterface[], count: number, loadMore = false) {
    this.totalEmployees = count;
    const allGridItems = allEmployees.map(employee => this.dataConverter.convertEmployeeToGridItem(employee));
    if (loadMore) {
      this.employees = [...this.employees, ...allEmployees];
      this.store.dispatch(new PeEmployeesActions.AddEmployees(allGridItems));
    } else {
      this.store.dispatch(new PeEmployeesActions.InitGridEmployees(allGridItems));
      this.employees = allEmployees;
    }

    this.store.dispatch(new PeEmployeesActions.FilteredEmployees(this.getFilteredGridItems()));

    this.initialized = true;
  }

  sortEmployees(field: GridSortingFieldsEnum) {
    const sortFn = this.sortHelper.getSortingFunctionByType(field);
    this.store.dispatch(new PeEmployeesActions.SortEmployees(sortFn));
  }

  // employee action
  addEmployeeToCollection(newEmployee: BusinessEmployeeInterface) {
    const newGridItem = this.dataConverter.convertEmployeeToGridItem(newEmployee);

    this.store.dispatch(new PeEmployeesActions.AddEmployee(newGridItem));
    this.employees.push(newEmployee);
  }

  editEmployeeInCollection(updatedEmployee: BusinessEmployeeInterface) {
    const updatedEmployeeIndex = this.employees.findIndex(({ _id }) => _id === updatedEmployee._id);
    this.employees[updatedEmployeeIndex] = updatedEmployee;

    const convertedEmployee = this.dataConverter.convertEmployeeToGridItem(updatedEmployee);
    this.store.dispatch(new PeEmployeesActions.PatchEmployee(convertedEmployee));
  }

  deleteEmployeeFromCollection(deletingId: string) {
    this.store.dispatch(new PeEmployeesActions.DeleteEmployee(deletingId));
  }

  getEmployeeById(editedEmployeeId: string) {
    return this.employees.find(({ _id }) => _id === editedEmployeeId) || null;
  }

  private filterItemsByNavbarFilter(
    sourceItemsArray: EmployeesGridItemInterface[], navbarFilter: PeSearchItem,
  ): EmployeesGridItemInterface[] {
    const text = navbarFilter.searchText.toLowerCase();

    return sourceItemsArray.filter((gridItem) => {
      const gridItemFieldValue = this.chooseGridItemFieldByFilterType(gridItem, navbarFilter);

      return navbarFilter.contains === PeFilterContainsEnum.Contains
        ? gridItemFieldValue.includes(text)
        : !gridItemFieldValue.includes(text);
    });
  }

  private chooseGridItemFieldByFilterType(gridItem: EmployeesGridItemInterface, navbarFilter: PeSearchItem): string {
    let gridItemFieldValue: string;

    switch (navbarFilter.filter) {
      case navbarFilterKeysEnum.All:
        gridItemFieldValue = gridItem.title as string;
        break;

      case navbarFilterKeysEnum.Name:
        gridItemFieldValue = gridItem.title as string;
        break;

      default:
        break;
    }

    return gridItemFieldValue.toLowerCase();
  }
}
