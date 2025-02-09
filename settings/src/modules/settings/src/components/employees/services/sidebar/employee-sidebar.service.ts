import { Injectable } from '@angular/core';
import { TreeFilterNode } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { BehaviorSubject } from 'rxjs';
import { SETTINGS_NAVIGATION } from '../../../../misc/constants/settings-constants';
import { PositionsEnum } from '../../../../misc/enum/positions.enum';
import { TranslatedListOptionInterface } from '../../../../misc/interfaces';
import { ApiService, BusinessEnvService } from '../../../../services';
import { SettingsRoutesEnum } from '../../../../settings-routes.enum';
import { employeePositionsOptions } from '../../constants';
import { GroupTreeDataInterface, PositionTreeDataInterface, SidebarCategoryInterface } from '../../interfaces';
import { IGroupItemInterface } from '../../interfaces/employee-group.interface';
import { PebEmployeeDialogOpenerService } from '../employee-dialog-opener/peb-employee-dialog-opener.service';

@Injectable()
export class PebEmployeeSidebarService {
  private readonly positions = employeePositionsOptions;
  isSidebarClosed$ = new BehaviorSubject(false);

  settingsData = SETTINGS_NAVIGATION;

  constructor(
    private translateService: TranslateService,
    private apiService: ApiService,
    private envService: BusinessEnvService,
    private employeeDialogOpener: PebEmployeeDialogOpenerService,
  ) {
  }

  toggleSidebar(a?: string) {
    if (a) {
      this.isSidebarClosed$.next(a === 'yes');

      return;
    }
    this.isSidebarClosed$.next(!this.isSidebarClosed$.value);
  }

  createSidebar(employeeGroups: any) {
    return this.settingsData.concat([
      {
        id: 'employees',
        name: 'employee group',
        image: '#icon-settings-person-icon',
        link: `${SettingsRoutesEnum.Employees}`,
      },
    ]);
  }

  getEmployeePositionsTree(): SidebarCategoryInterface {
    return {
      title: this.translateService.translate('pages.employees.sidebar.sections.position.title'),
      editMode: false,
      tree: this.positions.map(option => this.convertPositionOptionToTreeItem(option)),
    };
  }

  private convertPositionOptionToTreeItem(
    {value, labelKey}: TranslatedListOptionInterface<PositionsEnum>,
  ): TreeFilterNode<PositionTreeDataInterface> {
    const data: PositionTreeDataInterface = {
      isFolder: false,
      category: value,
    };

    return {
      id: labelKey,
      name: this.translateService.translate(labelKey),
      image: '#icon-settings-person-icon',
      editing: false,
      parentId: null,
      noToggleButton: true,
      data,
    };
  }

  convertGroupToTreeItem(groupItem: IGroupItemInterface): TreeFilterNode<GroupTreeDataInterface> {
    const data: GroupTreeDataInterface = {
      category: groupItem.name,
      isFolder: false,
    };

    return {
      id: groupItem._id,
      name: groupItem.name,
      image: '#icon-settings-person-icon',
      editing: false,
      parentId: null,
      noToggleButton: true,
      data,
    };
  }

  getEmployeeGroupsTree(groups) {
    return {
      title: 'Groups',
      id: '1',
      editMode: false,
      tree: groups.map(option => this.convertGroupToTreeItem(option)),
    };
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
