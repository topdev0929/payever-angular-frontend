import { timer } from 'rxjs';

import {
  FlowCloneReason,
  PaymentMethodEnum,
} from '@pe/checkout/types';

import { ApiErrorType } from '../enums';
import { ErrorDetails } from '../interfaces';

const win = window as any;

export abstract class BaseTrackingService {

  doEmitApiError(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    type: ApiErrorType,
    details: ErrorDetails = null,
  ): void {
    // payeverConsoleErrorMessages is filled by initPayeverConsoleLogger()
    // we add small delay to let console logs to appear
    timer(300).subscribe(() => {
      const consoleErrors: string[] = (window as any).payeverConsoleErrorMessages;
      if (details?.url && consoleErrors?.push) {
        consoleErrors.push(`--- ${details.method || ''} ${details.url}`);
      }
      this.doEmitEvent(flowId, paymentMethod, type, { consoleErrors });
    });
  }

  doEmitRateSelected(flowId: string, paymentMethod: PaymentMethodEnum, rateId: string): void {
    // rateId is reserved for future
    this.doEmitEvent(flowId, paymentMethod, 'rate_selected');
  }

  doEmitRateStepPassed(flowId: string, paymentMethod: PaymentMethodEnum): void {
    this.doEmitEvent(flowId, paymentMethod, 'rate_step_passed');
  }

  doEmitCustomEvent(flowId: string, paymentMethod: PaymentMethodEnum, eventName: string) {
    this.doEmitEvent(flowId, paymentMethod, eventName);
  }

  doEmitPaymentMethodLoaded(flowId: string, paymentMethod: PaymentMethodEnum): void {
    const key = `payment_payment_method_loaded_${flowId}_${paymentMethod}`;
    if (!win[`pe_backend_log_${key}`]) { // To prevent additional emit
      win[`pe_backend_log_${key}`] = true;
      this.doEmitEvent(flowId, paymentMethod, 'payment_method_loaded');
    }
  }

  doEmitFlowCloned(flowId: string, paymentMethod: PaymentMethodEnum, reason: FlowCloneReason): void {
    this.doEmitEvent(flowId, paymentMethod, `flow_cloned_on_${reason}`);
  }

  doEmitPaymentStepReached(flowId: string, paymentMethod: PaymentMethodEnum, stepIndex: number): void {
    const key = `payment_step_reached_${paymentMethod}_${stepIndex}`;
    if (!win[`pe_backend_log_${key}`]) { // To prevent additional emit
      win[`pe_backend_log_${key}`] = true;
      this.doEmitEvent(flowId, paymentMethod, key);
    }
  }

  protected abstract doEmitEvent(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    eventCode: string,
    details?: { [key: string]: any },
  ): void;
}
