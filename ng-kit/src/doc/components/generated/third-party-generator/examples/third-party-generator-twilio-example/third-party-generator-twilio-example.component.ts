import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { EnvironmentConfigService } from '../../../../../../kit/environment-config';
import { ThirdPartyFormServiceInterface } from '../../../../../../kit/third-party-form';
import { ThirdPartyFormTwilioStubService } from '../../services';

@Component({
  selector: 'doc-third-party-generator-twilio-example',
  templateUrl: 'third-party-generator-twilio-example.component.html',
  styleUrls: ['../../third-party-generator-doc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThirdPartyGeneratorTwilioExampleComponent implements OnInit {

  businessUuid: string = 'testTwilioBusinessUuid';
  integrationName: string = 'testTwilioName';
  integrationCategory: string = 'testTwilioCategory';

  thirdPartyFormService: ThirdPartyFormServiceInterface = new ThirdPartyFormTwilioStubService(this.integrationCategory);

  constructor(private configService: EnvironmentConfigService) {}

  ngOnInit(): void {
    return;
  }

  handleClose(): void {
    alert('Close!');
  }

  get baseApiData(): any {
    return {
      authStateData: {
        businessUuid: this.businessUuid,
        integrationName: this.integrationName,
        integrationCategory: this.integrationCategory,
        integrationId: 'testTwilioId',  // this.integration ? this.integration._id : null,
      }
    };
  }
}
