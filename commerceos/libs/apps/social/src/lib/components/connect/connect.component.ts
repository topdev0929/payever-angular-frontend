import { Component, ChangeDetectionStrategy } from '@angular/core';

import { PeSocialEnvService } from '../../services';

@Component({
  selector: 'pe-social-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSocialConnectComponent {

  constructor(
    private peSocialEnvService: PeSocialEnvService,
  ) { }

  public openConnectApp(integrationName?: string): void {
    this.peSocialEnvService.openConnectApp(integrationName);
  }
}
