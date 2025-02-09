import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';


import { groupQueryParam } from '../../../misc/constants';
import { BusinessEmployeeInterface } from '../../../misc/interfaces';
import { ApiService, BusinessEnvService } from '../../../services';
import { IGroupItemInterface } from '../interfaces/employee-group.interface';

import { PebBusinessEmployeesService } from './business-employees/business-employees.service';
import { PebBusinessEmployeesStorageService } from './business-employees-storage/business-employees-storage.service';
import { EmployeeFolderService } from './employee-folder.service';
import { PebEmployeeSidebarService } from './sidebar/employee-sidebar.service';

@Injectable()
export class EmployeeGroupService {
  constructor(
    private apiService: ApiService,
    private businessEnvService: BusinessEnvService,
    private sidebarService: PebEmployeeSidebarService,
    private employeesService: PebBusinessEmployeesService,
    private employeeFolderService: EmployeeFolderService,
    private employeesStorage: PebBusinessEmployeesStorageService,
  ) {}

  removeGroup(id): Observable<{ name: string }> {
    return this.apiService.deleteEmployeeGroup(this.businessEnvService.businessUuid, id).pipe(
      tap((res: { name: string }) => {
        this.employeesStorage.groups.data.splice(
          this.employeesStorage.groups.data.findIndex(group => group.name === res.name),
          1
        );
      }),
    );
  }

  openDialogAddEmployeeGroup(id: string = null, group = null): Observable<boolean> {
    if (id) {
      const storageGroup = this.employeesStorage.groups.data.find(group => group._id === id);
      const editGroup = group ?? storageGroup;

      return this.sidebarService.editEmployeeGroup(id, editGroup).pipe(map(() => false));
    }

    return this.sidebarService.createEmployeeGroup().pipe(
      map((createdGroup) => {
        createdGroup && this.employeesStorage.groups.data.push(createdGroup);

        return !!createdGroup;
      }),
    );
  }

  createEmployeeGroup(event): Observable<IGroupItemInterface> {
    const nameCheck = event.data?.name && /\S+/.test(event.data?.name);
    if (this.employeeFolderService.checkUniqueFolderName(event) && nameCheck) {
      event.data.data = { ...event.data.data, param: groupQueryParam, category: event.data?.name };

      return this.sidebarService.createEmployeeGroupFromTree(event.data).pipe(
        tap((result: IGroupItemInterface) => {
          event.apply(result);
          this.employeesStorage.groups.data.push(result);
        }),
      );
    }

    return of(event.apply());
  }

  removeEmployeesFromGroup(employeesIds, currentSidebarItemSelected): Observable<BusinessEmployeeInterface> {
    const group = this.employeesStorage.groups?.data.find(res => res.name === currentSidebarItemSelected);

    return this.apiService.deleteEmployeeFromGroup(
      this.businessEnvService.businessUuid,
      group._id,
      employeesIds
    ).pipe(
      tap(() => {
        const employees = this.employeesStorage.groups.data.find(gr => gr._id === group._id).employees;
        const newEmployees = employees.filter(employee => !employeesIds.includes(employee));
        this.employeesStorage.groups.data.find(item => item._id === group._id).employees = newEmployees;
        this.employeesService.refreshExistEmployees();
      }),
    );
  }
}
