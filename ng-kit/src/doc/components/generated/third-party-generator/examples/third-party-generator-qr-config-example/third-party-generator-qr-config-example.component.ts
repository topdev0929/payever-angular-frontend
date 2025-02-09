import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { EnvironmentConfigService } from '../../../../../../kit/environment-config';
import { ThirdPartyFormServiceInterface } from '../../../../../../kit/third-party-form';
import { ThirdPartyFormQrConfigStubService } from '../../services';

@Component({
  selector: 'doc-third-party-generator-qr-config-example',
  templateUrl: 'third-party-generator-qr-config-example.component.html',
  styleUrls: ['../../third-party-generator-doc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThirdPartyGeneratorQrConfigExampleComponent implements OnInit {

  businessUuid: string = 'testQrBusinessUuid';
  integrationName: string = 'testQrName';
  integrationCategory: string = 'testQrCategory';

  thirdPartyFormService: ThirdPartyFormServiceInterface = new ThirdPartyFormQrConfigStubService(this.integrationCategory);

  backgroundImage: string = require('../../../../../../doc/assets/img/qr.png');

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
