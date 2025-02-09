import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { EnvironmentConfigService } from '../../../../../../kit/environment-config';
import { ThirdPartyFormServiceInterface } from '../../../../../../kit/third-party-form';
import { ThirdPartyFormStripeStubService } from '../../services';

@Component({
  selector: 'doc-third-party-generator-stripe-example',
  templateUrl: 'third-party-generator-stripe-example.component.html',
  styleUrls: ['../../third-party-generator-doc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThirdPartyGeneratorStripeExampleComponent implements OnInit {

  businessUuid: string = 'testStripeBusinessUuid';
  integrationName: string = 'testStripeName';
  integrationCategory: string = 'testStripeCategory';

  thirdPartyFormService: ThirdPartyFormServiceInterface = new ThirdPartyFormStripeStubService(this.integrationCategory);

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
        integrationId: 'testStripeId',  // this.integration ? this.integration._id : null,
      }
    };
  }
}
