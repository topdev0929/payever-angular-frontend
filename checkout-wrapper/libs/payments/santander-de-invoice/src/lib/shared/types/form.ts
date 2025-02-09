import { Observable } from 'rxjs';

import { DialogService } from '@pe/checkout/dialog';
import { AddressInterface, PaymentApiCallInterface } from '@pe/checkout/types';

export interface FormStepperInitConfigInterface {
  billingAddress: AddressInterface;
  stringToDate: (value: string | Date) => Date;
  fieldActive$: (key: string) => Observable<boolean>;
  isShowSalutationFields: boolean;
  isShowPhoneField: boolean;
  dialogService: DialogService;
  flowApiCall: PaymentApiCallInterface;
  isPos: boolean;
  merchantMode: boolean;
}
