import {
  Component,
  ChangeDetectionStrategy,
  Output,
  OnInit,
  EventEmitter,
} from '@angular/core';

import { NodeApiService } from '@pe/checkout/api';
import { TopLocationService } from '@pe/checkout/location';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { TimestampEvent } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { prepareData } from '@pe/checkout/utils/prepare-data';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';
import { PeDestroyService } from '@pe/destroy';

import {
  BaseContainerComponent,
  NodePaymentDetailsInterface,
} from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-nl-inquiry-container',
  templateUrl: './inquiry-container.component.html',
  providers: [PeDestroyService],
})
export class InquiryContainerComponent extends BaseContainerComponent implements OnInit {

  isSendingPayment = false;

  @Output() loading: EventEmitter<boolean> = new EventEmitter();
  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  protected externalRedirectStorage: ExternalRedirectStorage = this.injector.get(ExternalRedirectStorage);

  protected env: EnvironmentConfigInterface = this.injector.get(PE_ENV);
  protected nodeApiService: NodeApiService = this.injector.get(NodeApiService);
  protected windowTopLocation: TopLocationService = this.injector.get(TopLocationService);
  protected localeConstantsService: LocaleConstantsService = this.injector.get(LocaleConstantsService);

  ngOnInit(): void {
    this.buttonText.next($localize `:@@payment-santander-nl.actions.pay:`);
    this.onServiceReady.emit(true);
  }

  triggerSubmit(): void {
    this.onSend({});
  }

  onSend(formData: unknown): void {
    this.sendPaymentData(formData);
  }

  protected sendPaymentData(formData: unknown): void {
    const nodePaymentDetails: NodePaymentDetailsInterface = prepareData(formData);

    this.nodeFlowService.setPaymentDetails(nodePaymentDetails);

    this.continue.emit();
  }
}
