import { NgModule } from '@angular/core';

import { AddressStorageService } from './address-storage.service';
import { ExternalNavigateData } from './external-navigate-data';
import { PayByLinkApiService } from './pay-by-link.api.service';
import { PaymentInquiryStorage } from './payment-inquiry-storage';
import { SendToDeviceStorage } from './send-to-device-storage';
import { ExternalRedirectStorage } from './external-redirect-storage';


@NgModule({
  providers: [
    AddressStorageService,
    ExternalNavigateData,
    PaymentInquiryStorage,
    SendToDeviceStorage,
    PayByLinkApiService,
    ExternalRedirectStorage,
  ],
})
export class StorageModule {}
