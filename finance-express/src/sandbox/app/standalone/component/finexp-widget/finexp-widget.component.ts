import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';

import { PayeverPaymentWidgetLoader } from '../../../../../modules/finexp-widget/pe-finexp-widget';

@Component({
  templateUrl: './finexp-widget.component.html',
  styleUrls: ['./finexp-widget.component.scss']
})
export class FinexpWidgetComponent {

  channelSetId: string = null;
  type: string = null;

  constructor(
    @Inject(PE_ENV) protected env: EnvInterface,
    protected activatedRoute: ActivatedRoute
  ) {
    this.channelSetId = this.activatedRoute.snapshot.params['channelSetId'];
    this.type = this.activatedRoute.snapshot.params['type'];

    setTimeout(() => {
      const loader = new PayeverPaymentWidgetLoader();
      loader.init(
        '.payever-finexp-widget',
        '/env.json'
      );
    }, 500);
  }
}
