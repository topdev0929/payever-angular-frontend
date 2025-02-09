import { Params } from '@angular/router';

import { PaymentMethodEnum } from '../enums';

export interface CheckoutStateParamsInterface {
  merchantMode?: boolean;
  embeddedMode?: boolean;
  clientMode?: boolean;
  openNextStepOnInit?: boolean; // Should be triggered once
  forceUseCard?: boolean;
  forceNoPaddings?: boolean;
  forceFullScreen?: boolean;
  forceNoSnackBarNotifications?: boolean;
  showQRSwitcher?: boolean;
  showCreateCart?: boolean;
  forceNoScroll?: boolean;
  forcePhoneRequired?: boolean;
  forceCodeForPhoneRequired?: boolean;
  forceNoCloseButton?: boolean;
  forceShowBusinessHeader?: boolean;
  forcePaymentOnly?: boolean; // choose payment + payment step only, step 2 opened
  forceSinglePaymentMethodOnly?: PaymentMethodEnum; // filter all payments to have only single
  forceChoosePaymentOnlyAndSubmit?: boolean; // choose payment + payment step only, submit on load
  forceNoOrder?: boolean;
  forceNoHeader?: boolean;
  forceNoSendToDevice?: boolean;
  forceHideReference?: boolean;
  forceHidePreviousSteps?: boolean;
  forceHideShareButton?: boolean;
  cancelButtonText?: string;
  layoutWithPaddings?: boolean;
  showOtherPayment?: boolean;
  generatePaymentCode?: boolean;
  showOrderAmount?: boolean;
  processed?: boolean;

  // Internal:
  forceAddressOnlyFillEmptyAllowed?: boolean; // Allow only to fill empty fields at address step
  forceShowOrderStep?: boolean; // Should be triggered once

  editMode?: boolean;
  setDemo?: boolean;
  isBillingAddressStepVisible?: boolean;

  sendingPaymentSigningLink?: boolean;
  redirectToPaymentQueryParams?: Params;
}
