import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { merge } from 'rxjs';

import { PeEmailValidator, PeCustomValidators } from '@pe/shared/custom-validators';

import { MOBILE_PHONE_PATTERN } from '../../../../misc/constants';
import {
  NewBusinessEmployeeAddressInterface,
  NewBusinessEmployeeInterface,
  PositionInterface,
} from '../../../../misc/interfaces';
import { BusinessEmployeeInterface } from '../../../../misc/interfaces/business-employees/business-employee.interface';
import { BusinessEnvService } from '../../../../services';

export type EmployeeFields = keyof NewBusinessEmployeeInterface;
type EmployeeValues = NewBusinessEmployeeInterface[EmployeeFields];

export type EmployeeAddressFields = keyof NewBusinessEmployeeAddressInterface;
type EmployeeAddressValues = NewBusinessEmployeeAddressInterface[EmployeeAddressFields];

@Injectable()
export class PebEmployeeDialogFormService {

  constructor(
    private fb: FormBuilder,
    private envService: BusinessEnvService) {
  }

  private form: FormGroup;

  initFormGroup(employee?: BusinessEmployeeInterface): FormGroup {
    this.form = this.fb.group(this.getEmployeeFormObject(employee));

    this.form.controls.acls = this.fb.group({});
    this.form.controls.address = this.initAddressForm(employee?.address);

    return this.form;
  }

  get dirty() : boolean {
    return this.form.dirty || this.form.controls.acls.dirty || this.form.controls.address.dirty;
  }

  markAllAsPristine(){
    this.form.markAsPristine();
    this.form.controls.acls.markAsPristine();
    this.form.controls.address.markAsPristine();
  }

  get valueChanges$() {
    return merge(
      this.form.valueChanges,
      this.form.controls.acls.valueChanges,
      this.form.controls.address.valueChanges,
    );
  }

  private getEmployeeFormObject(
    employee?: BusinessEmployeeInterface
  ): Record<EmployeeFields, [EmployeeValues] | [EmployeeValues, ValidatorFn[]]> {
    const employeeArray: PositionInterface[] = (!Array.isArray(employee?.positions) && employee?.positions) ? [employee?.positions] : [];
    const allPositions: PositionInterface[] = Array.isArray(employee?.positions)
      ? employee?.positions
      : employeeArray;
    const position: PositionInterface = allPositions.find(pos => pos.businessId === this.envService.businessUuid);
    // @ts-ignore
    const formObj: Record<EmployeeFields, [EmployeeValues] | [EmployeeValues, ValidatorFn[]]> = {
      userId: [null],
      logo: [employee?.logo || null],
      status: [position?.status || null],
      first_name: [employee?.first_name || null, [Validators.required, PeCustomValidators.NoWhiteSpace]],
      last_name: [employee?.last_name || null, [Validators.required, PeCustomValidators.NoWhiteSpace]],
      email: [
        employee?.email ? { value: employee.email, disabled: true } : null,
        [PeEmailValidator, Validators.required]],
      position: [position?.positionType || null, [Validators.required]],
      acls: [null],
      phoneNumber: [employee?.phoneNumber || null, [Validators.pattern(MOBILE_PHONE_PATTERN)]],
      companyName: [employee?.companyName || null],
      address: [null],
    };

    return formObj;
  }

  private initAddressForm(address: NewBusinessEmployeeAddressInterface = {}) {
    const addressFormObj: Record<EmployeeAddressFields, [EmployeeAddressValues]> = {
      country: [address?.country || null],
      city: [address?.city || null],
      street: [address?.street || null],
      zipCode: [address?.zipCode || null],
    };

    return this.fb.group(addressFormObj);
  }

}
