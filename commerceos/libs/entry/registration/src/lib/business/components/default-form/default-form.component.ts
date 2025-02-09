import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { BusinessDataInterface } from '@pe/shared/business-form';

import { BaseBusinessFormComponent } from '../base-business-form.component';

@Component({
  selector: 'entry-default-business-registration',
  templateUrl: './default-form.component.html',
  styleUrls: ['./default-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultBusinessRegistrationComponent extends BaseBusinessFormComponent implements OnInit {

  prepareBusinessData(): BusinessDataInterface {
    return {
      id: this.businessId,
      name: this.businessData.name,
      companyAddress: {
        country: this.businessData.countryPhoneCode.split(':')[0],
      },
      companyDetails: {
        businessStatus: this.businessData.businessStatus,
        status: this.businessData.status,
        salesRange: this.businessData.salesRange,
        product: this.businessData.industry.productCode,
        industry: this.businessData.industry.value,
        phone: this.businessData.countryPhoneCode.split(':')[1] + this.businessData.phoneNumber,
      },
    };
  }
}
