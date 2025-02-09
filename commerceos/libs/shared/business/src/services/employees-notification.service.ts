/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, throwError } from 'rxjs';

import { PeAuthService } from '@pe/auth';
import { CosEnvService } from '@pe/base';
import { EnvService, UserTypeBusinessEnum } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';
import { BusinessState } from '@pe/user';

const ERROR_MESSAGE = 'app.employee-permission.insufficient.error';

@Injectable({ providedIn: 'root' })
export class EmployeesNotificationService<T> {
  @Select(BusinessState.businessAccessOptions) businessAccessOptions$: Observable<T>;

  constructor(
    protected envService: EnvService,
    protected cosEnvService: CosEnvService,
    protected authService: PeAuthService,
    protected snackbarService: SnackbarService,
    protected translateService: TranslateService,
  ) {}

  isEmployee(options) {
    return options?.userTypeBusiness === UserTypeBusinessEnum.Employee
      || options?.userTypeBusiness === UserTypeBusinessEnum.EmployeeAdmin;
  }

  employeeNotification(errorResponse?: HttpErrorResponse): Observable<null> {
    this.snackbarService.toggle(true, {
      content: this.translateService.translate(errorResponse?.error?.message || ERROR_MESSAGE),
      iconId: 'icon-alert-24',
      duration: 15000,
      iconColor: '#E2BB0B',
    });

    return throwError(null);
  }
}
