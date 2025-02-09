import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { EnvironmentConfigService } from '../../../../../../kit/environment-config/src/services/environment-config.service';
import {
  HandlePayeverFieldsSaveCallback
} from '../../../../../../kit/third-party-generator';

@Component({
  selector: 'doc-third-party-generator-amazon-example',
  templateUrl: 'third-party-generator-amazon-example.component.html',
  styleUrls: ['../../third-party-generator-doc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThirdPartyGeneratorAmazonExampleComponent implements OnInit {

  businessUuid: string = 'testAmazonBusinessUuid';
  integrationName: string = 'testAmazonName';
  integrationCategory: string = 'testAmazonCategory';

  payEverFieldsData: any = {
    pe_fullSynchronization: true
  };

  constructor(private configService: EnvironmentConfigService) {}

  ngOnInit(): void {
    return;
  }

  onPayEverFieldSave: HandlePayeverFieldsSaveCallback = data => {
    
    return of(null).pipe(delay(1000));
  }

  handleClose(): void {
    alert('Close!');
  }

  get baseApiUrl(): string {
    return `${this.configService.getConfig().backend.thirdParty}/api/business/${this.businessUuid}/subscription/${this.integrationName}/call`;
  }

  get baseApiData(): any {
    return {
      authStateData: {
        businessUuid: this.businessUuid,
        integrationName: this.integrationName,
        integrationCategory: this.integrationCategory,
        integrationId: 'testAmazonId',  // this.integration ? this.integration._id : null,
      }
    };
  }
}
