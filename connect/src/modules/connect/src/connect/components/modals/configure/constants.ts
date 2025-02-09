import { CommunicationsModule, DevicePaymentsMainComponent } from '../../../../communications';
import { ConfigureThirdPartyComponent } from './third-party/third-party.component';
import { PayexFakturaMainComponent } from '../../../../payments/modules/payex_faktura';
import { PayexCreditcardMainComponent } from '../../../../payments/modules/payex_creditcard';
import { SantanderInvoiceNoMainComponent } from '../../../../payments/modules/santander_invoice_no';
import { SantanderInstallmentsMainComponent } from '../../../../payments/modules/santander_installment';
import { SantanderPosInstallmentMainComponent } from '../../../../payments/modules/santander_pos_installment';
import { SantanderCcpInstallmentMainComponent } from '../../../../payments/modules/santander_ccp_installment';
import { SantanderInstallmentNoMainComponent } from '../../../../payments/modules/santander_installment_no';
import { SantanderInstallmentDkMainComponent } from '../../../../payments/modules/santander_installment_dk';
import { SantanderInstallmentSeMainComponent } from '../../../../payments/modules/santander_installment_se';
import { SantanderPosInstallmentSeMainComponent } from '../../../../payments/modules/santander_pos_installment_se';
import { ApiMainComponent } from '../../../../shopsystems/modules/api/components';
import { ShopifyMainComponent } from '../../../../shopsystems/modules/shopify/components';
import { DandomainMainComponent } from '../../../../shopsystems/modules/dandomain/components';
import { DefaultPluginMainComponent } from '../../../../shopsystems/modules/default-plugin/components';
import { PaymentsModule } from '../../../../payments';
import { ShopsystemsModule } from '../../../../shopsystems';

export const modalComponents = {
  communications: {
    'device-payments': DevicePaymentsMainComponent,
    'twilio': ConfigureThirdPartyComponent,
    'qr': ConfigureThirdPartyComponent,
    default: ConfigureThirdPartyComponent
  },

  payments: {
    'santander_installment': SantanderInstallmentsMainComponent,
    'santander_pos_installment': SantanderPosInstallmentMainComponent,
    'santander_ccp_installment': SantanderCcpInstallmentMainComponent,
    // 'santander_installment_no': SantanderInstallmentNoMainComponent,
    // 'santander_installment_dk': SantanderInstallmentDkMainComponent,
    // 'santander_installment_se': SantanderInstallmentSeMainComponent,
    // 'santander_pos_installment_se': SantanderPosInstallmentSeMainComponent,
    // 'santander_invoice_no': SantanderInvoiceNoMainComponent,
    'payex_creditcard': PayexCreditcardMainComponent,
    'payex_faktura': PayexFakturaMainComponent,
    default: ConfigureThirdPartyComponent
  },

  shopsystems: {
    'api': ApiMainComponent,
    'shopify': ShopifyMainComponent,
    'dandomain': DandomainMainComponent,

    'magento': DefaultPluginMainComponent,
    'presta': DefaultPluginMainComponent,
    'shopware': DefaultPluginMainComponent,
    'jtl': DefaultPluginMainComponent,
    'oxid': DefaultPluginMainComponent,
    'xt_commerce': DefaultPluginMainComponent,
    'plentymarkets': DefaultPluginMainComponent,
    'woo_commerce': DefaultPluginMainComponent,

    default: ConfigureThirdPartyComponent
  },

  default: ConfigureThirdPartyComponent
};

export const modalModules = {
  payments: PaymentsModule,
  shopsystems: ShopsystemsModule,
  communications: CommunicationsModule,
  default: CommunicationsModule
};
