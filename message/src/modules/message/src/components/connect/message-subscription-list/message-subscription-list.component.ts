import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeMessageIntegration } from '../../../enums';
import { PeMessageSubscription } from '../../../interfaces';

@Component({
  selector: 'pe-message-subscription-list',
  templateUrl: './message-subscription-list.component.html',
  styleUrls: ['./message-subscription-list.component.scss'],
  providers: [PeDestroyService],
})
export class PeMessageSubscriptionListComponent {

  peMessageIntegration = PeMessageIntegration;

  formGroup = this.formBuilder.group({});
  messageAppColor = '';

  constructor(
    private destroyed$: PeDestroyService,
    private formBuilder: FormBuilder,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
  ) {

    this.peOverlayData.subscriptionList.map((subscription: PeMessageSubscription) => {
      this.formGroup.addControl(subscription.integration.name, new FormControl(subscription.enabled));
    });

    this.formGroup.valueChanges.pipe(
      tap(value => {
        this.peOverlayData.changes = value;
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  getLabel(name: string): string {
    switch (name) {
      case PeMessageIntegration.WhatsApp: {
        return 'WhatsApp';
      }
      case PeMessageIntegration.FacebookMessenger: {
        return 'Facebook Messenger';
      }
      case PeMessageIntegration.Payever: {
        return 'Live Chat';
      }
      case PeMessageIntegration.Telegram: {
        return 'Telegram';
      }
      case PeMessageIntegration.InstagramMessenger: {
        return 'Instagram Messenger';
      }
    }

    return '';
  }

}
