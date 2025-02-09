import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { AccountTypeEnum, PeAuthService } from '@pe/auth';

import { RegistrationFormDataInterface, RegistrationPayloadInterface, TokenDataInterface } from '../interfaces';

@Injectable()
export class EmployeeRegisterService {
  constructor(
    private authService: PeAuthService,
    private apiService: ApiService,
  ) {}

  registerEmployee(
    tokenData: TokenDataInterface,
    inviteToken: string,
    payload: RegistrationPayloadInterface,
    formData: RegistrationFormDataInterface,
  ) {
    return !inviteToken
      ? this.authService.registerEmployeeInBusiness(payload, tokenData.businessId)

      : this.authService.register(payload,null, AccountTypeEnum.Employee).pipe(
        switchMap(() => this.registrationEmployeeInBusinessByTokenData(tokenData, formData)),
      );
  }

  registrationEmployeeInBusinessByTokenData(tokenData, formData) {
    if (tokenData?.businessId) {
      const employeeId = tokenData.id ?? this.authService.getUserData().uuid;

      return this.apiService
        .registerEmployeeAndConfirmBusiness(employeeId, tokenData.businessId, formData.email, {
          businessId: tokenData.businessId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          password: formData.password,
        }).pipe(map(() => tokenData));
    }

    return of(null);
  }
}
