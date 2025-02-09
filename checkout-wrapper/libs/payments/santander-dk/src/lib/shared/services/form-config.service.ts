import { Injectable } from '@angular/core';

import { SectionSchemeInterface } from '@pe/checkout/form-utils';

@Injectable()
export class FormConfigService {
  sectionsConfig(): SectionSchemeInterface[] {
    return [
      {
        name: 'mitidSkat',
        title: $localize`:@@santander-dk.inquiry.step.mitid_skat.title:`,
        isButtonHidden: true,
      },
      {
        name: 'appDetails',
        title: $localize`:@@santander-dk.inquiry.step.app_details.title:`,
        continueButtonTitle: $localize`:@@santander-dk.actions.continue:`,
        isButtonHidden: true,
      },
    ];
  }
}
