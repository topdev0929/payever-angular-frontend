import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { forkJoin, Observable, Subject } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { PeDataGridPaginator } from '@pe/common';
import { PeGridItemsActions, PeGridState } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';

import { GridSortingFieldsEnum } from '../../../../misc/enum';
import {
  BusinessEmployeeInterface,
  EmployeeStatusEnum,
} from '../../../../misc/interfaces';
import { ApiService, BusinessEnvService } from '../../../../services';
import { SidebarFilterInterface } from '../../interfaces';
import { EmployeesGridItemInterface } from '../../interfaces/employees-grid-item.interface';
import { PeEmployeesActions } from '../../state/employees';
import { PebBusinessEmployeesStorageService } from '../business-employees-storage/business-employees-storage.service';
import { PebEmployeeDialogOpenerService } from '../employee-dialog-opener/peb-employee-dialog-opener.service';

@Injectable()
export class PebBusinessEmployeesService {
  private readonly selectedItems$ = new Subject<string[]>();

  get businessId(): string {
    return this.envService.businessUuid;
  }

  get filteredGridItems(): EmployeesGridItemInterface[] {
    return this.employeesStorage.getFilteredGridItems();
  }

  constructor(
    private authService: PeAuthService,
    private apiService: ApiService,
    private envService: BusinessEnvService,
    private snackbarService: SnackbarService,
    private employeeDialogOpener: PebEmployeeDialogOpenerService,
    private employeesStorage: PebBusinessEmployeesStorageService,
    private translateService: TranslateService,
    private store: Store,
  ) {
  }

  // datagrid observables
  getEmployees(): EmployeesGridItemInterface[] {
    return this.store.selectSnapshot(PeGridState.gridItems());
  }

  // employees
  createEmployee(groupId = null): void {
    this.employeeDialogOpener.dialogRef = this.employeeDialogOpener.openNewEmployeeDialog(groupId);

    this.employeeDialogOpener.dialogRef.afterClosed.pipe(
      take(1),
      tap((response) => {
        if (response) {
          const { createdEmployee, group } = response;
          if (group) {
            this.employeesStorage.groups.data.find(res => res._id === group._id).employees = group.employees;
          }
          this.addEmployee(createdEmployee);
          this.showSnackBar('dialogs.new_employee.action_result.success.add');
        }
      }),
    ).subscribe();
  }

  addEmployee(newEmployee): void {
    this.employeesStorage.totalEmployees++;
    this.employeesStorage.addEmployeeToCollection(newEmployee);
  }

  editEmployee(employeeId: string): void {
    const editingEmployee = this.employeesStorage.getEmployeeById(employeeId);
    this.employeeDialogOpener.dialogRef = this.employeeDialogOpener.openUpdateEmployeeDialog(editingEmployee);

    this.employeeDialogOpener.dialogRef.afterClosed.pipe(
      take(1),
      tap((response) => {
        if (response) {
          const { updatedEmployee } = response;
          this.employeesStorage.editEmployeeInCollection(updatedEmployee);

          const successType = editingEmployee.status === EmployeeStatusEnum.inactive ? 'invited' : 'edit';
          this.showSnackBar(`dialogs.new_employee.action_result.success.${successType}`);
        }
      }),
    ).subscribe();
  }

  inviteEmployeeToGroups(employeeId: string): void {
    this.apiService.inviteEmployeeToGroups(this.businessId, employeeId).pipe(
      take(1),
      tap({
        next: () => {
          this.showSnackBar('dialogs.new_employee.action_result.success.invited');
        },
      }),
    ).subscribe();
  }

  approveEmployee(employeeId: string): Observable<void> {
    return this.apiService.addEmployeeToBusiness(employeeId, this.businessId).pipe(
      take(1),
      tap({
        next: () => {
          this.showSnackBar('dialogs.new_employee.action_result.success.approved');
        },
      }),
    );
  }

  loadEmployees(filter: SidebarFilterInterface, paginator: PeDataGridPaginator, loadMore = false): void {
    this.employeesStorage.setSidebarFilter(filter);
    if (this.employeesStorage.isEmployeesLoaded && !loadMore) {
      this.store.dispatch(new PeEmployeesActions.FilteredEmployees(this.filteredGridItems));

      return;
    }

    this.apiService.getBusinessEmployeeList(this.businessId, paginator.perPage, paginator.page).pipe(
      switchMap(res => this.apiService.getEmployeesForApprove(this.businessId).pipe(
        map((needApprove: BusinessEmployeeInterface[]) => ({
          list: [...res.data, ...needApprove],
          count: res.count,
        })),
      )),
      tap(({ list, count }) => this.employeesStorage.setEmployeesList(list, count, loadMore)),
      take(1),
    ).subscribe();
  }

  addImportedEmployees(items: []): void {
    items.forEach(item => this.employeesStorage.addEmployeeToCollection(item));
  }

  refreshExistEmployees(): void {
    this.employeesStorage.isEmployeesLoaded
      && this.store.dispatch(new PeEmployeesActions.FilteredEmployees(this.filteredGridItems));
  }

  deleteSelectedEmployees(employeeIds: string[]): void {
    const deletingEmployees$ = employeeIds.map(
      deletingId => this.apiService.deleteBusinessEmployee(this.businessId, deletingId)
        .pipe(
          tap(() => {
            this.employeesStorage.deleteEmployeeFromCollection(deletingId);
          }),
        ),
    );

    this.store.dispatch(new PeGridItemsActions.DeleteItems(employeeIds));

    forkJoin(...deletingEmployees$).pipe(take(1)).subscribe();
  }

  // select items actions
  selectAllEmployees(): void {
    const visibleItem = this.filteredGridItems;
    const visibleSelectedIds = visibleItem.map(({ id }) => id);

    this.selectedItems$.next(visibleSelectedIds);
  }

  deselectEmployee(ids: string[] = []): void {
    this.selectedItems$.next([]);
  }

  sortEmployees(field: GridSortingFieldsEnum): void {
    this.employeesStorage.sortEmployees(field);
  }

  showSnackBar(notification: string = 'form.create_form.employee.options.saved', success = true): void {
    this.snackbarService.toggle(true, {
      content: this.translateService.translate(notification),
      duration: 3000,
      iconId: success ? 'icon-commerceos-success' : 'icon-alert-24',
      iconSize: 24,
    });
  }
}
