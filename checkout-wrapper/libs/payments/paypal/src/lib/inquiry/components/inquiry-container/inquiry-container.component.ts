import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';

import { TopLocationService } from '@pe/checkout/location';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import {
  FlowStateEnum,
  TimestampEvent,
} from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';
import { PeDestroyService } from '@pe/destroy';

import {
  BaseContainerComponent,
  FormInterface,
} from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'paypal-inquiry-container',
  templateUrl: './inquiry-container.component.html',
  providers: [PeDestroyService],
})
export class InquiryContainerComponent extends BaseContainerComponent implements OnInit {

  isSendingPayment = false;

  @Output() loading: EventEmitter<boolean> = new EventEmitter();
  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  protected env: EnvironmentConfigInterface = this.injector.get(PE_ENV);
  protected externalRedirectStorage: ExternalRedirectStorage = this.injector.get(ExternalRedirectStorage);
  protected windowTopLocation: TopLocationService = this.injector.get(TopLocationService);
  protected localeConstantsService: LocaleConstantsService = this.injector.get(LocaleConstantsService);

  ngOnInit(): void {
    this.buttonText.next($localize `:@@payment-paypal.actions.redirect_to_paypal:`);
    this.onServiceReady.emit(true);
  }

  triggerSubmit(): void {
    this.onSend({});
  }

  onSend(formData: FormInterface): void {
    if (this.isFlowHasFinishedPayment()) {
      this.showFinishModalFromExistingPayment();
    } else {
      this.sendPaymentData(formData);
    }
  }

  isFlowHasFinishedPayment(): boolean {
    return Boolean(this.flow && [FlowStateEnum.FINISH, FlowStateEnum.CANCEL].indexOf(this.flow.state) >= 0);
  }

  showFinishModalFromExistingPayment(): void {
    this.continue.next();
  }

  protected sendPaymentData(formData: FormInterface): void {

    this.nodeFlowService.setPaymentDetails(formData);
    this.continue.emit();
  }
}
