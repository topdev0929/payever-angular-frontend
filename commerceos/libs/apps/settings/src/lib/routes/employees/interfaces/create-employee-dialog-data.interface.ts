import { BehaviorSubject } from 'rxjs';

import { BusinessEmployeeInterface } from '../../../misc/interfaces/business-employees/business-employee.interface';

import { IGroupItemInterface } from './employee-group.interface';

export interface CreateEmployeeDialogDataInterface {
  dirty$ : BehaviorSubject<boolean>;
  businessId: string;
  employee?: BusinessEmployeeInterface;
  theme?: string;
  groupId?: string;
}

export interface ICreateEmployeeGroupDialogDataInterface {
  dirty$ : BehaviorSubject<boolean>;
  businessId: string;
  theme?: string;
  groupId?: string;
  group?: IGroupItemInterface;
}
