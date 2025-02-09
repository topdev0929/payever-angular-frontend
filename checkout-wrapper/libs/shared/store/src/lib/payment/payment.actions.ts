import { AbstractPaymentService } from '@pe/checkout/payment';
import {
  ChangePaymentDataInterface,
  NodePaymentResponseInterface,
  PaymentMethodEnum,
  PaymentStatusEnum,
  ResponseErrorsInterface,
} from '@pe/checkout/types';

type Payments = {
  [Key in PaymentMethodEnum]?: any;
}

export class SetPayments {
  static readonly type = '[Payment] Set payments data';
  constructor(public payload: Payments) {}
}

export class SetPaymentDetails {
  static readonly type = '[Payment] Set payment data';
  constructor(public payload: any) {}
}

export class PatchPaymentDetails {
  static readonly type = '[Payment] Patch payment data';
  constructor(public payload: any) {}
}

export class GetPaymentOptions {
  static readonly type = '[Payment] Get payment options';
}

export class SetPaymentOptions {
  static readonly type = '[Payment] Set payment options';
  constructor(public payload: any) {}
}

export class PatchPaymentResponse {
  static readonly type = '[Payment] Patch payment response';
  constructor(public payload: any) {}
}

export class GetApiCallData {
  static readonly type = '[Payment] Get api call data';
  constructor(public payload: NodePaymentResponseInterface<any>) {}
}

export class PostPayment {
  static readonly type = '[Payment] Post payment';
}

export class PostPaymentComplete {
  static readonly type = '[Payment] Post payment complete';
}

export class EditPayment {
  static readonly type = '[Payment] Edit payment';
  constructor(public payload: string) {}
}

export class UpdatePayment {
  static readonly type = '[Payment] Update payment';
  constructor(public payload: string) {}
}

export class PollUpdatePayment {
  static readonly type = '[Payment] Poll update status';
  constructor(public payload: PaymentStatusEnum[]) {}
}

export class GetPayment {
  static readonly type = '[Payment] Get payment';
}

export class PollPaymentForStatus {
  static readonly type = '[Payment] Poll payment for status';
  constructor(public payload: PaymentStatusEnum[]) {}
}

export class ChangeFailedPayment {
  static readonly type = '[Payment] Change failed payment';
  constructor(public payload?: ChangePaymentDataInterface) {}
}

export class SubmitPayment {
  static readonly type = '[Payment] Submit payment';
}

export class PatchFormState<T> {
  static readonly type = '[Payment] Patch form state';
  constructor(public form: T) {}
}

export class SetFormState<T> {
  static readonly type = '[Payment] Set form state';
  constructor(public form: T) {}
}

export class ClearFormState {
  static readonly type = '[Payment] Clear form state';
}

export class SetPaymentError {
  static readonly type = '[Payment] Set payment error';
  constructor(public error: ResponseErrorsInterface) {}
}

export class SetPaymentService {
  static readonly type = '[Payment] Set payment service';
  constructor(public paymentService: AbstractPaymentService) {}
}
