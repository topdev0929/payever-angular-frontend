import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import produce from 'immer';

import { EmployeesGridItemInterface } from '../../interfaces/employees-grid-item.interface';

import {
  PeEmployeesActions,
} from './employees.actions';

export class PebEmployees {
  allGridItems: EmployeesGridItemInterface[];
  filteredItems: EmployeesGridItemInterface[];
}

@State<PebEmployees>({
  name: 'employeesState',
  defaults: {
    allGridItems: [],
    filteredItems: [],
  },
})
@Injectable()
export class PebEmployeesState {

  @Selector()
  static allGridItems(state: PebEmployees) {
    return state.allGridItems;
  }

  @Selector()
  static selectedFolderItems(state: PebEmployees) {
    return state.filteredItems;
  }

  @Action(PeEmployeesActions.InitGridEmployees)
  initGridItems({ patchState }: StateContext<PebEmployees>, { allGridItems }: PeEmployeesActions.InitGridEmployees) {
    patchState({ allGridItems });
  }

  @Action(PeEmployeesActions.FilteredEmployees)
  setFilteredItems(
    { patchState }: StateContext<PebEmployees>,
    { filteredItems }: PeEmployeesActions.FilteredEmployees,
  ) {
    patchState({ filteredItems });
  }

  @Action(PeEmployeesActions.AddEmployee)
  addItem({ patchState, getState }: StateContext<PebEmployees>, { newItem }: PeEmployeesActions.AddEmployee) {
    const state = produce(getState(), (draft: PebEmployees) => {
      draft.allGridItems = [...draft.allGridItems, newItem];
      draft.filteredItems = [...draft.filteredItems, newItem];
    });

    patchState(state);
  }

  @Action(PeEmployeesActions.AddEmployees)
  addEmployees({ patchState, getState }: StateContext<any>, { allGridItems }: PeEmployeesActions.AddEmployees) {
    const state = produce(getState(), (draft) => {
      draft.allGridItems = [...draft.allGridItems, ...allGridItems];
    });
    patchState(state);
  }

  @Action(PeEmployeesActions.DeleteEmployee)
  deleteItem({ patchState, getState }: StateContext<PebEmployees>, { deletingId }: PeEmployeesActions.DeleteEmployee) {
    const state = produce(getState(), (draft: PebEmployees) => {
      const deletedItemIndex = draft.allGridItems.findIndex(({ id }) => id === deletingId);
      draft.allGridItems.splice(deletedItemIndex, 1);

      const deletedFilteredItemIndex = draft.filteredItems.findIndex(({ id }) => id === deletingId);
      draft.filteredItems.splice(deletedFilteredItemIndex, 1);
    });

    patchState(state);
  }

  @Action(PeEmployeesActions.PatchEmployee)
  updateEmployee(
    { patchState, getState }: StateContext<PebEmployees>,
    { updatedEmployee }: PeEmployeesActions.PatchEmployee,
  ) {
    const state = produce(getState(), (draft: PebEmployees) => {
      draft.allGridItems = draft.allGridItems.map(i => i.id === updatedEmployee.id ? updatedEmployee : i);
      draft.filteredItems = draft.filteredItems.map(i => i.id === updatedEmployee.id ? updatedEmployee : i);
    });

    patchState(state);
  }

  @Action(PeEmployeesActions.SortEmployees)
  sortEmployees({ patchState, getState }: StateContext<PebEmployees>, { sortFn }: PeEmployeesActions.SortEmployees) {
    const state = produce(getState(), (draft: PebEmployees) => {
      draft.filteredItems = draft.filteredItems.slice().sort(sortFn);
    });

    patchState(state);
  }
}
