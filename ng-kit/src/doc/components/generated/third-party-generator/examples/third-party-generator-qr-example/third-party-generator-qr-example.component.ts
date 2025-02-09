import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { EnvironmentConfigService } from '../../../../../../kit/environment-config';
import { ThirdPartyFormServiceInterface } from '../../../../../../kit/third-party-form';
import { ThirdPartyFormQrStubService } from '../../services';

@Component({
  selector: 'doc-third-party-generator-qr-example',
  templateUrl: 'third-party-generator-qr-example.component.html',
  styleUrls: ['../../third-party-generator-doc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThirdPartyGeneratorQrExampleComponent implements OnInit {

  businessUuid: string = 'testQrBusinessUuid';
  integrationName: string = 'testQrName';
  integrationCategory: string = 'testQrCategory';

  thirdPartyFormService: ThirdPartyFormServiceInterface = new ThirdPartyFormQrStubService(this.integrationCategory);

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
        integrationId: 'testQrId',  // this.integration ? this.integration._id : null,
      }
    };
  }
}
