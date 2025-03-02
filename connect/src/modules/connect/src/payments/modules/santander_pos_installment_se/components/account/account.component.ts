import { Component, Injector, ViewChildren, QueryList } from '@angular/core';

import { MatExpansionPanel } from '@angular/material/expansion';

import { PaymentMethodEnum } from '../../../../../shared';
import {
  BaseAccountSantanderComponent
} from '../../../shared/components/base-account-santander/base-account-santander.component';
import { REQUIRED_FIELDS_SANTANDER_SE } from '../../../../constants';

@Component({
  selector: 'account',
  templateUrl: './../../../shared/components/base-account-santander/base-account-santander.component.html',
  styleUrls: ['./../../../shared/components/base-account-santander/base-account-santander.component.scss']
})
export class SantanderPosInstallmentSeAccountComponent extends BaseAccountSantanderComponent {

  readonly sendApplicationOnSave: boolean = true;
  readonly submitButtonText = 'actions.submit';
  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_SE;
  @ViewChildren('panel') panels: QueryList<MatExpansionPanel>;
  requiredFields = REQUIRED_FIELDS_SANTANDER_SE;

  constructor(injector: Injector) {
    super(injector);
  }
}
