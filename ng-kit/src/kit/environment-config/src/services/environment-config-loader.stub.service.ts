import { Injectable, Provider } from '@angular/core';
import { Observable, of } from 'rxjs';

import { EnvironmentConfigService } from './environment-config.service';
import { EnvironmentConfigLoaderService } from './environment-config-loader.service';
import { EnvironmentConfigLoaderServiceInterface } from './environment-config-loader.service.interface';

const json = {
  config: {
    tmetrixOrigId: 'cx8xec1a',
    recaptchaSiteKey: '6LdIMMoUAAAAAKVUtUXgPMJbj3TLmzCPaoSnWles',
    googleMapsApiKey: 'AIzaSyDB-7kzuFYxb8resf60yF21TKUkTbGhljc',
    fullStoryOrgId: '',
    env: 'test'
  },
  custom: {
    storage: 'https://payevertesting.blob.core.windows.net',
    i18n: 'https://translation-backend.test.devpayever.com',
    proxy: 'https://proxy.test.devpayever.com',
    cdn: 'https://payevertest.azureedge.net',
    integrator: 'https://integrator.devpayever.com',
    translation: 'https://payevertesting.blob.core.windows.net'
  },
  primary: {
    main: 'https://test.devpayever.com',
    mainHost: 'test.devpayever.com',
    shop: 'https://test.devpayever.shop',
    shopHost: 'test.devpayever.shop',
    business: 'https://test.payever.business',
    businessHost: 'test.payever.business',
    email: 'https://test.payever.email',
    emailHost: 'test.payever.email'
  },
  php: {
    checkout: 'https://checkout-php.test.devpayever.com',
    financeExpress: 'https://finance-express-php.test.devpayever.com',
    translation: 'https://translation-backend.test.devpayever.com'
  },
  connect: {
    dandomain: 'https://dandomain-backend.test.devpayever.com',
    debitoor: '',
    dhl: 'https://dhl-backend.test.devpayever.com',
    shopify: 'https://shopify-backend.test.devpayever.com',
    twilio: 'https://twilio-connect.test.devpayever.com',
    qr: 'https://qr-backend.test.devpayever.com'
  },
  backend: {
    appRegistry: 'https://app-registry.test.devpayever.com',
    auth: 'https://auth.test.devpayever.com',
    builder: 'https://builder-backend.test.devpayever.com',
    builderShop: 'https://builder-shop.test.devpayever.com',
    builderMedia: 'https://builder-media.test.devpayever.com',
    builderGenerator: 'https://builder-generator.test.devpayever.com',
    channels: 'https://channels-backend.test.devpayever.com',
    checkout: 'https://checkout-backend.test.devpayever.com',
    commerceos: 'https://commerceos-backend.test.devpayever.com',
    common: 'https://common-backend.test.devpayever.com',
    connect: 'https://connect-backend.test.devpayever.com',
    contacts: 'https://contacts-backend.test.devpayever.com',
    coupons: '',
    financeExpress: '',
    mailer: 'https://mailer.test.devpayever.com',
    mailerReport: 'https://mailer-report-backend.test.devpayever.com',
    marketing: 'https://marketing-backend.test.devpayever.com',
    media: 'https://media.test.devpayever.com',
    notifications: 'https://notifications-backend.test.devpayever.com',
    notificationsWs: 'wss://notifications-backend.test.devpayever.com/ws',
    inventory: 'https://inventory-backend.test.devpayever.com',
    payments: 'https://checkout-php.test.devpayever.com',
    plugins: 'https://plugins-backend.test.devpayever.com',
    pos: 'https://pos-backend.test.devpayever.com',
    products: 'https://products-backend.test.devpayever.com',
    shipping: 'https://shipping-backend.test.devpayever.com',
    shops: '',
    shop: 'https://shop-backend.test.devpayever.com',
    thirdParty: 'https://third-party.test.devpayever.com',
    transactions: 'https://transactions-backend.test.devpayever.com',
    users: 'https://users.test.devpayever.com',
    widgets: 'https://widgets-backend.test.devpayever.com',
    wallpapers: 'https://wallpapers-backend.test.devpayever.com',
    devicePayments: 'https://device-payments-backend.test.devpayever.com',
    synchronizer: 'https://synchronizer-backend.test.devpayever.com',
    billingSubscription: 'https://billing-subscription-backend.test.devpayever.com',
    paymentNotifications: 'https://payment-notifications-backend.test.devpayever.com',
    paymentDataStorage: 'https://payment-data-storage-backend.test.devpayever.com'
  },
  frontend: {
    builder: 'https://builder-frontend.test.devpayever.com',
    builderClient: 'https://builder-client-frontend.test.devpayever.com',
    builderTranslate: '',
    cart: 'https://cart-frontend.test.devpayever.com',
    checkout: 'https://checkout-frontend.test.devpayever.com',
    checkoutWrapper: 'https://checkout.test.devpayever.com',
    commerceos: 'https://commerceos.test.devpayever.com',
    connect: 'https://connect-frontend.test.devpayever.com',
    contacts: 'https://contacts-frontend.test.devpayever.com',
    marketing: 'https://marketing-frontend.test.devpayever.com',
    paymentOptionsSantanderDe: 'https://payment-santander-de-frontend.test.devpayever.com',
    paymentOptionsSantanderDeCcp: 'https://payment-santander-de-ccp-frontend.test.devpayever.com',
    paymentOptionsSantanderDeFact: 'https://payment-santander-de-fact-frontend.test.devpayever.com',
    paymentOptionsSantanderDeInvoice: 'https://payment-santander-de-invoice-frontend.test.devpayever.com',
    paymentOptionsSantanderNoInvoice: 'https://payment-santander-no-invoice-frontend.test.devpayever.com',
    paymentOptionsSantanderDk: 'https://payment-santander-dk-frontend.test.devpayever.com',
    paymentOptionsSantanderSe: 'https://payment-santander-se-frontend.test.devpayever.com',
    paymentOptionsSantanderNo: 'https://payment-santander-no-frontend.test.devpayever.com',
    paymentOptionsSantanderNl: 'https://santander-nl-frontend.test.devpayever.com',
    paymentOptionsPayex: 'https://payment-payex-frontend.test.devpayever.com',
    paymentOptionsPaypal: 'https://payment-paypal-frontend.test.devpayever.com',
    paymentOptionsSofort: 'https://payment-sofort-frontend.test.devpayever.com',
    paymentOptionsStripe: 'https://payment-stripe-frontend.test.devpayever.com',
    paymentOptionsWiretransfer: 'https://payment-wiretransfer-frontend.test.devpayever.com',
    paymentOptionsInstantPayment: 'https://payment-instant-payment-frontend.test.devpayever.com',
    pos: 'https://pos-frontend.test.devpayever.com',
    posClient: '',
    products: 'https://products-frontend.test.devpayever.com',
    settings: 'https://settings.test.devpayever.com',
    shipping: 'https://shipping-frontend.test.devpayever.com',
    shops: '',
    shopsClient: '',
    transactions: 'https://transactions-frontend.test.devpayever.com'
  },
  thirdParty: {
    communications: 'https://communications-third-party.test.devpayever.com',
    payments: 'https://payments-third-party.test.devpayever.com'
  },
  payments: {
    stripe: 'https://stripe-payments.test.devpayever.com',
    instantPayment: 'https://instant-payment-payments.test.devpayever.com',
    santanderNl: 'https://santander-nl-payments.test.devpayever.com'
  }
};

@Injectable()
export class EnvironmentConfigLoaderStubService implements EnvironmentConfigLoaderServiceInterface {

  constructor(private configService: EnvironmentConfigService) {
  }

  loadEnvironmentConfig(): Observable<boolean> {
    this.configService.addConfig(json);
    return of(true);
  }

  static provide(): Provider {
    return {
      provide: EnvironmentConfigLoaderService,
      useClass: EnvironmentConfigLoaderStubService
    };
  }
}
