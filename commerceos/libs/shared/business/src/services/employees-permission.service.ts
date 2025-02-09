/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { BusinessAccessOptionsInterface } from '@pe/business';
import { EnvService, MicroRegistryService } from '@pe/common';
import { DockerService } from '@pe/docker';
import { BusinessState } from '@pe/user';

import { EmployeesNotificationService } from './employees-notification.service';

@Injectable()
export class EmployeesPermissionService {
  @Select(BusinessState.businessAccessOptions) businessAccessOptions$: Observable<BusinessAccessOptionsInterface>;

  constructor(
    protected apiService: ApiService,
    protected envService: EnvService,
    private employeesNotificationService: EmployeesNotificationService<BusinessAccessOptionsInterface>,
    private dockerService: DockerService,
    private microRegistryService: MicroRegistryService,
  ) {}

  checkApps(code: string): Observable<boolean> {
    return this.businessAccessOptions$.pipe(
      filter(options => !!options),
      switchMap(options => this.employeesNotificationService.isEmployee(options)
        ? this.microRegistryService.getRegisteredMicros(this.envService.businessId).pipe(
          tap(() => this.dockerService.initDocker()),
          map(apps => !!apps.find(app => app.code === code)),
          tap(isAppAvailable => !isAppAvailable && this.employeesNotificationService.employeeNotification()),
        )
        : of(true)
      ),
    );
  }
}
