import { Component } from '@angular/core';

import { DevModeService } from '../../../../../../../../kit/dev';

@Component({
  selector: 'docs-example-dev-mode-service-in-use',
  templateUrl: './dev-mode-service-in-use.component.html',
})
export class DevModeServiceInUseComponent {

  constructor(
    public devModeService: DevModeService
  ) {}

}
