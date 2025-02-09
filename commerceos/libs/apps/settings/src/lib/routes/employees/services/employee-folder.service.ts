import { Injectable } from '@angular/core';

import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { PebBusinessEmployeesStorageService } from './business-employees-storage/business-employees-storage.service';

@Injectable()
export class EmployeeFolderService {
  constructor(
    private translationService: TranslateService,
    private snackbarService: SnackbarService,
    protected employeesStorage: PebBusinessEmployeesStorageService,
  ) {}

  getMessage(name): string {
    return this.translationService.translate('pages.employees.sidebar.groups.duplicate_message_1')
      + name
      + this.translationService.translate('pages.employees.sidebar.groups.duplicate_message_2');
  }

  checkUniqueFolderName(event): boolean {
    const existingGroup = this.employeesStorage.groups.data.find(
      group => group.name === event.data.name
        && event.data._id !== group._id
    );

    if (existingGroup) {
      const message = this.getMessage(existingGroup.name);
      this.snackbarService.toggle(true, {
        content: message,
        duration: 2500,
        iconId: 'icon-alert-24',
        iconSize: 24,
      });
    }

    return !!existingGroup;
  }
}
