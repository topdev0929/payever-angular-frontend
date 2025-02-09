import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { EnvService, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { FolderItem, PeFoldersContextMenuEnum } from '@pe/shared/folders';

import { groupQueryParam, needApproveQueryParam, positionQueryParam } from '../../../../misc/constants';
import { PositionsEnum } from '../../../../misc/enum/positions.enum';
import { TranslatedListOptionInterface } from '../../../../misc/interfaces';
import { ApiService, BusinessEnvService } from '../../../../services';
import { employeePositionsOptions } from '../../constants';
import { GroupTreeDataInterface, PositionTreeDataInterface } from '../../interfaces';
import { IGroupItemInterface } from '../../interfaces/employee-group.interface';
import { PebEmployeeDialogOpenerService } from '../employee-dialog-opener/peb-employee-dialog-opener.service';

@Injectable()
export class PebEmployeeSidebarService {
  isSidebarClosed$ = new BehaviorSubject(false);

  private readonly positions = employeePositionsOptions;

  constructor(
    private translateService: TranslateService,
    private apiService: ApiService,
    @Inject(EnvService) private envService: BusinessEnvService,
    private employeeDialogOpener: PebEmployeeDialogOpenerService,
    @Inject(PE_ENV) private env,
  ) {
  }

  toggleSidebar(a?: string) {
    if (a) {
      this.isSidebarClosed$.next(a === 'yes');

      return;
    }
    this.isSidebarClosed$.next(!this.isSidebarClosed$.value);
  }

  sidebarCategories(groups): FolderItem[] {
    return [
      {
        _id: groupQueryParam,
        name: this.translateService.translate('form.create_form.groups.label'),
        position: 0,
        menuItems:  [PeFoldersContextMenuEnum.AddFolder],
        children: groups.map(option => this.convertGroupToTreeItem(option)),
        data: {
          param: groupQueryParam,
        },
      },
      {
        _id: positionQueryParam,
        position: 1,
        isHideMenu: true,
        name: this.translateService.translate('pages.employees.sidebar.sections.position.title'),
        children: this.positions.map(option => this.convertPositionOptionToTreeItem(option)),
        data: {
          param: positionQueryParam,
        },
      },
      {
        _id: needApproveQueryParam,
        name: this.translateService.translate('pages.employees.sidebar.sections.employees_for_approve'),
        position: 2,
        isHideMenu: true,
        data: {
          param: needApproveQueryParam,
          category: needApproveQueryParam,
        },
      },
    ];
  }

  private convertPositionOptionToTreeItem(
    { value, labelKey }: TranslatedListOptionInterface<PositionsEnum>,
  ): FolderItem<PositionTreeDataInterface> {
    const data: PositionTreeDataInterface = {
      isFolder: false,
      category: value,
      param: positionQueryParam,
    };

    return {
      _id: labelKey,
      isHideMenu: true,
      position: 1,
      name: this.translateService.translate(labelKey),
      image: `${this.env.custom.cdn}/icons-transactions/folder.svg`,
      editing: false,
      data,
    };
  }

  convertGroupToTreeItem(groupItem: IGroupItemInterface): FolderItem<GroupTreeDataInterface> {
    const data: GroupTreeDataInterface = {
      category: groupItem.name,
      isFolder: false,
      param: groupQueryParam,
    };

    return {
      _id: groupItem._id,
      menuItems:  [
        PeFoldersContextMenuEnum.Edit,
        PeFoldersContextMenuEnum.Open,
        PeFoldersContextMenuEnum.Delete,
      ],
      position: 1,
      name: groupItem.name,
      image: `${this.env.custom.cdn}/icons-transactions/folder.svg`,
      editing: false,
      data,
    };
  }

  createEmployeeGroupFromTree(value): Observable<IGroupItemInterface> {
    let employeeGroup = this.apiService.createBusinessEmployeeGroup(this.envService.businessId, value);

    if (value.groupId) {
      employeeGroup = this.apiService.updateBusinessEmployeeGroup(
          this.envService.businessId,
          value,
          value.groupId,
        );
      }

    return employeeGroup;
  }

  updateEmployeeGroupFromTree(value) {
    return this.apiService.updateBusinessEmployeeGroup(
        this.envService.businessId,
        value,
        value._id,
      );
  }

  createEmployeeGroup() {
    this.employeeDialogOpener.dialogRef = this.employeeDialogOpener.openNewEmployeeGroupDialog();

    return this.employeeDialogOpener.dialogRef.afterClosed;
  }

  editEmployeeGroup(groupId, group) {
    this.employeeDialogOpener.dialogRef = this.employeeDialogOpener.openEditEmployeeGroupDialog(groupId, group);

    return this.employeeDialogOpener.dialogRef.afterClosed;
  }
}
