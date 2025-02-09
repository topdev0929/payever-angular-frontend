export const panelsData = {
  accountings: [
    {
      icon: '#icon-debitoor-bw',
      title: 'Debitoor',
      installationOptions: {
        optionIcon: '#icon-debitoor-bw',
        price: 'Free',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/Debitoor.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Debitoor-1.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Debitoor-2.png'
          // }
        ],
        category: 'Accounting',
        developer: 'payever GmbH',
        languages: 'English, German',
        description: `Tired of late customer payments? Now you can get paid within minutes
         by giving your customers a comfortable and secure way to accept PayPal, credit card, direct debit,
         or SOFORTüberweisung directly through Debitoor invoice.
         It only takes you a few minutes and is free of charge.`,
        appSupport: 'https://payever.de/help/app-market/debitoor/',
        website: 'https://debitoor.de/funktionen/add-ons/zahlungsanbieter',
        pricingLink: 'https://www.payever.org'
      }
    }
  ],
  communications: [
    {
      icon: '#icon-communication-twillio',
      title: 'Twilio SMS',
      installationOptions: {
        optionIcon: '#icon-communication-twillio',
        price: 'No monthly fees. Pay per transaction.',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/Twilio.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Twilio-1-step.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Twilio-2-step.png'
          // }
        ],
        category: 'Communication',
        developer: 'payever GmbH',
        languages: 'English, German',
        description: `With Twilio inside payever you can send SMS to your customers for differnet purposes.
          Let them pay via payever Point of Sale directly on their phone or send marketing offers.
          Everything is easy and simple to use.`,
        appSupport: 'https://getpayever.com/developer/external-payment/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.payever.org'
      }
    }
  ],
  payments: [
    {
      id: 25,
      icon: '#icon-payment-option-directdebit',
      title: 'Direct Debit',
      payment_method: "paymill_directdebit",
      installationOptions: {
        optionIcon: '#icon-payment-option-directdebit',
        price: 'No monthly fees. Pay per transaction.',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/directdebit.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/PayPal-1.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/PayPal-2.png'
          // }
        ],
        countryList: ['DE'],
        category: 'Payments',
        developer: 'payever GmbH',
        languages: 'English, German',
        description: `Direct Debit is the faster, safer way for your customers to make an online payment to your merchant account.
            Connect your Direct Debit account with payever with one simple login. It takes you seconds and you can
            directly accept Direct Debit payments for all channels including your Shop, Checkout, Point of Sale or Marketing.`,
        appSupport: 'https://getpayever.com/payments/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.paymill_directdebit.com'
      }
    },
    {
      id: 17,
      icon: '#icon-payment-option-paymill',
      title: 'Paymill Credit Card',
      payment_method: "paymill_creditcard",
      installationOptions: {
        optionIcon: '#icon-payment-option-paymill',
        price: 'No monthly fees. Pay per transaction.',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/paymill.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/PayPal-1.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/PayPal-2.png'
          // }
        ],
        countryList: ['DE'],
        category: 'Payments',
        developer: 'payever GmbH',
        languages: 'English, German',
        description: `Paymill is the faster, safer way for your customers to make an online payment to your merchant account.
            Connect your Paymill account with payever with one simple login. It takes you seconds and you can
            directly accept Paymill payments for all channels including your Shop, Checkout, Point of Sale or Marketing.`,
        appSupport: 'https://getpayever.com/payments/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.paymill.com'
      }
    },
    {
      id: 27,
      icon: '#icon-payment-option-paypall',
      title: 'PayPal',
      payment_method: "paypal",
      installationOptions: {
        optionIcon: '#icon-payment-option-paypall',
        price: 'No monthly fees. Pay per transaction.',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/pay-pal.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/PayPal-1.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/PayPal-2.png'
          // }
        ],
        countryList: [],
        category: 'Payments',
        developer: 'payever GmbH',
        languages: 'English, German',
        description: `PayPal is the faster, safer way for your customers to make an online payment to your merchant account.
            Connect your PayPal account with payever with one simple login. It takes you seconds and you can
            directly accept PayPal payments for all channels including your Shop, Checkout, Point of Sale or Marketing.`,
        appSupport: 'https://getpayever.com/payments/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.paypal.com/us/webapps/mpp/merchant-fees'
      }
    },
    {
      id: 28,
      icon: '#icon-payment-option-stripe',
      title: 'Stripe Credit Card',
      payment_method: "stripe",
      installationOptions: {
        optionIcon: '#icon-payment-option-stripe',
        price: 'No monthly fees. Pay per transaction.',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/stripe.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Stripe-1.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Stripe-2.png'
          // }
        ],
        countryList: [],
        category: 'Payments',
        developer: 'payever GmbH',
        languages: 'English, German',
        description: `With Stripe inside payever you can accept credit cards within minutes:
           Just create an online account leaving a few information about you and your business.
           After that you can already accept payments in every selling channel.
           It´s the easier and fastest way to accept credit card payments.`,
        appSupport: 'https://getpayever.com/payments/',
        website: 'https://www.payever.org',
        pricingLink: 'https://stripe.com/de/pricing'
      }
    },
    {
      id: 12,
      icon: '#icon-payment-option-sofort',
      title: 'Sofortüberweisung',
      payment_method: "sofort",
      installationOptions: {
        optionIcon: '#icon-payment-option-sofort',
        price: 'No monthly fees. Pay per transaction.',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/sofort.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Sofort-1.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Sofort-2.png'
          // },
        ],
        countryList: ['DE', 'AT', 'CH', 'GB', 'ES', 'FR', 'HU', 'IT', 'NL', 'PL', 'UK', 'CZ', 'SK'],
        category: 'Payments',
        developer: 'payever GmbH',
        languages: 'English, German',
        description: `Sofortüberweisung enables your customers to securely transfer you money
            directly during the payment process as a payment option. Accept payments in any channel and get safe payments
            directly into your business bank account.`,
        appSupport: 'https://getpayever.com/payments/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.klarna.com/sofort/business/mit-sofort-verkaufen/'
      }
    },
    {
      id: 29,
      icon: '#icon-payment-option-santander',
      title: 'Santander Installments',
      payment_method: "santander_installment",
      installationOptions: {
        optionIcon: '#icon-payment-option-santander',
        price: 'No monthly fees. Pay per transaction.',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/santander.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Santander-Installment-1.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Santander-Installment-2.png'
          // }
        ],
        countryList: ['DE'],
        category: 'Payments',
        developer: 'payever GmbH',
        languages: 'German',
        description: `With Santander installment inside payever you can accept part payments starting as low as 99€
           and without limits up. Raise the average size of your baskets by offering this payment option to your customers.
            Online and at the Point of Sale.`,
        appSupport: 'https://getpayever.com/payments/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.santander.com'
      }
    },
    {
      id: 47,
      icon: '#icon-payment-option-santander',
      title: 'Santander installment factoring',
      payment_method: "santander_factoring_de",
      installationOptions: {
        optionIcon: '#icon-payment-option-santander',
        price: 'No monthly fees. Pay per transaction.',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/santander.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Santander-Factoring-1.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Santander-Factoring-2.png'
          // }
        ],
        countryList: ['DE'],
        category: 'Payments',
        developer: 'payever GmbH',
        languages: 'German',
        description: `Santander Installment Factoring is the easiest way to accept installments inside any channel of payever.
           Your customers don´t need to go to a postal office and can finish the installment within seconds.`,
        appSupport: 'https://getpayever.com/payments/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.santander.com'
      }
    },
    {
      id: 41,
      icon: '#icon-payment-option-santander',
      title: 'Santander Comfort Card Plus',
      payment_method: "santander_ccp_installment",
      installationOptions: {
        optionIcon: '#icon-payment-option-santander',
        price: 'No monthly fees. Pay per transaction.',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/santander.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Santander-Comfort-Card-Plus-1.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Santander-Comfort-Card-Plus-2.png'
          // }
        ],
        countryList: ['DE'],
        category: 'Payments',
        developer: 'payever GmbH',
        languages: 'German',
        description: `Santander Comfort Card Plus enables installment payments with a physical card.
            Your customers get in addition to the installment payment that generally
            happens one time an option to finance goods many times in the future.`,
        appSupport: 'https://getpayever.com/payments/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.santander.com'
      }
    },
    {
      id: 45,
      icon: '#icon-payment-option-santander',
      title: 'Santander Invoice',
      payment_method: "santander_invoice_de",
      installationOptions: {
        optionIcon: '#icon-payment-option-santander',
        price: 'No monthly fees. Pay per transaction.',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/santander.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Santander-Installment-1.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Santander-Installment-2.png'
          // }
        ],
        countryList: ['DE'],
        category: 'Payments',
        developer: 'payever GmbH',
        languages: 'German',
        // tslint:disable
        description: `
            Santander Invoice inside payever is the easiest way for your customers to pay online:

            1. Customer leaves address and birthday information
            2. Waits a few seconds
            3. Gets approved and received the goods
            
            
            FOR BUSINESSES
            
            - You have no risk and get fully covered by Santander
            - Ship goods directly after the approval to your customers
            - Fair pricing
            
            
            FOR CUSTOMERS
            
            - Receive goods without entering payment data or paying upfront
            - A fair reminder system without direct fees
            - No risk by entering data or paying upfront

          `,
        // tslint:enable
        appSupport: 'https://getpayever.com/payments/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.santander.com'
      }
    },
    {
      id: 30,
      icon: '#icon-payment-option-santander',
      title: 'Santander Installment POS',
      payment_method: "santander_pos_installment",
      installationOptions: {
        optionIcon: '#icon-payment-option-santander',
        price: 'No monthly fees. Pay per transaction.',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/santander.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Santander-Installments-POS-DE-1.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Santander-Installments-POS-DE-2.png'
          // }
        ],
        countryList: ['DE'],
        category: 'Payments',
        developer: 'payever GmbH',
        languages: 'German',
        description: `With Santander installment inside payever you can accept part payments starting as low as 99€
            and without limits up. Raise the average size of your baskets by offering this payment option to your customers.
            Online and at the Point of Sale.`,
        appSupport: 'https://getpayever.com/payments/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.santander.com'
      }
    },
    {
      id: 15,
      icon: '#icon-payment-option-wire-transfer',
      title: 'Wire transfer',
      payment_method: "cash",
      installationOptions: {
        optionIcon: '#icon-payment-option-wire-transfer',
        price: 'No monthly fees. Pay per transaction.',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/WooCommerce.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-1-step.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-2-step.png'
          // }
        ],
        countryList: ['DE'],
        category: 'Payments',
        developer: 'payever GmbH',
        languages: 'German',
        description: `Offer your customers the most established and for businesses most secure payment option.
            Customers transfer money directly to your bank account. Once you´ve received the money you ship the goods.`,
        appSupport: 'https://getpayever.com/payments/',
        website: 'https://www.payever.org',
        pricingLink: 'https://payever.de/payments/'
      }
    },
    {
      id: 37,
      icon: '#icon-payment-option-santander',
      title: 'Santander installment',
      payment_method: "santander_installment_dk",
      installationOptions: {
        optionIcon: '#icon-payment-option-santander',
        price: 'No monthly fees. Pay per transaction.',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/santander.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Santander-Installments-Denmark-1.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Santander-Installments-Denmark-2.png'
          // }
        ],
        countryList: ['DK'],
        category: 'Payments',
        developer: 'payever GmbH',
        languages: 'English',
        description: `With Santander installment inside payever you can accept part payments.
           Raise the average size of your baskets by offering this payment option to your customers.`,
        appSupport: 'https://getpayever.com/payments/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.santander.dk'
      }
    },
    {
      id: 31,
      icon: '#icon-payment-option-santander',
      title: 'Santander Installment / BuyNowPayLater',
      payment_method: "santander_installment_no",
      installationOptions: {
        optionIcon: '#icon-payment-option-santander',
        price: 'No monthly fees. Pay per transaction.',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/santander.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Santander-Installments-Norway-1.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Santander-Installments-Norway-2.png'
          // }
        ],
        countryList: ['NO'],
        category: 'Payments',
        developer: 'payever GmbH',
        languages: 'English',
        description: `With Santander installment inside payever you can accept part payments.
           Raise the average size of your baskets by offering this payment option to your customers.`,
        appSupport: 'https://getpayever.com/payments/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.santander.no'
      }
    },
    {
      id: 39,
      icon: '#icon-payment-option-santander',
      title: 'Santander installment',
      payment_method: "santander_installment_se",
      installationOptions: {
        optionIcon: '#icon-payment-option-santander',
        price: 'No monthly fees. Pay per transaction.',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/santander.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Santander-Installments-Sweden-1.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Santander-Installments-Sweden-2.png'
          // }
        ],
        countryList: ['SE'],
        category: 'Payments',
        developer: 'payever GmbH',
        languages: 'English',
        description: `With Santander installment inside payever you can accept part payments.
           Raise the average size of your baskets by offering this payment option to your customers.`,
        appSupport: 'https://getpayever.com/payments/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.santander.se'
      }
    },
    {
      id: 40,
      icon: '#icon-payment-option-payex',
      title: 'PayEx Invoice / Faktura',
      payment_method: "payex_faktura",
      installationOptions: {
        optionIcon: '#icon-payment-option-payex',
        price: 'No monthly fees. Pay per transaction.',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/pay-ex.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/PayEx-Invoice-1.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/PayEx-Invoice-2.png'
          // }
        ],
        countryList: ['SE'],
        category: 'Payments',
        developer: 'payever GmbH',
        languages: 'English',
        // tslint:disable
        description: `
          Santander Invoice inside payever is the easiest way for your customers to pay online:

          1. Customer enters his SSN number
          2. Waits a few seconds
          3. Gets approved and received the goods


          FOR BUSINESSES

          - You have no risk and get fully covered by Santander
          - Ship goods directly after the approval to your customers
          - Fair pricing


          FOR CUSTOMERS

          - Receive goods without entering payment data or paying upfront
          - A fair reminder system without direct fees
          - No risk by entering data or paying upfront`,
        // tslint:enable
        appSupport: 'https://getpayever.com/payments/',
        website: 'https://www.payever.org',
        pricingLink: 'https://payex.com'
      }
    },
    {
      id: 42,
      icon: '#icon-payment-option-payex',
      title: 'PayEx Credit Card',
      payment_method: "payex_creditcard",
      installationOptions: {
        optionIcon: '#icon-payment-option-payex',
        price: 'No monthly fees. Pay per transaction.',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/pay-ex.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/PayEx-Credit-Card-1.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/PayEx-Credit-Card-2.png'
          // }
        ],
        countryList: ['SE'],
        category: 'Payments',
        developer: 'payever GmbH',
        languages: 'English',
        description: `With PayEx inside payever you can accept credit cards.
           Enable your customers to pay via credit cards inside your online shop.`,
        appSupport: 'https://getpayever.com/payments/',
        website: 'https://www.payever.org',
        pricingLink: 'https://payex.com'
      }
    }
  ],
  shopSystems: [
    {
      icon: '#icon-woo-commerce-bw',
      title: 'WooCommerce',
      installationOptions: {
        optionIcon: '#icon-woo-commerce-bw',
        price: 'Free',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/WooCommerce.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-1-step.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-2-step.png'
          // }
        ],
        countryList: [],
        category: 'Shopsystem',
        developer: 'payever GmbH',
        languages: 'English, German, Russian',
        description: 'With the WooCommerce Plugin on payever you can accept all payever Checkout payments inside your WooCommerce shop.',
        appSupport: 'https://getpayever.com/shopsystem/woocommerce/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.payever.org'
      }
    },
    {
      icon: '#icon-magento',
      title: 'Magento',
      installationOptions: {
        optionIcon: '#icon-magento',
        price: 'Free',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/Magento.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-1-step.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-2-step.png'
          // }
        ],
        countryList: [],
        category: 'Shopsystem',
        developer: 'payever GmbH',
        languages: 'German, English',
        description: 'With the Magento Plugin on payever you can accept all payever Checkout payments inside your Magento shop.',
        appSupport: 'https://getpayever.com/shopsystem/magento/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.payever.org'
      }
    },
    {
      icon: '#icon-prestashop-bw',
      title: 'Prestashop',
      installationOptions: {
        optionIcon: '#icon-prestashop-bw',
        price: 'Free',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/Presta.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-1-step.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-2-step.png'
          // }
        ],
        countryList: [],
        category: 'Shopsystem',
        developer: 'payever GmbH',
        languages: 'German, English',
        description: 'With the Prestashop Plugin on payever you can accept all payever Checkout payments inside your Prestashop shop.',
        appSupport: 'https://getpayever.com/shopsystem/presta/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.payever.org'
      }
    },
    {
      icon: '#icon-shopware',
      title: 'Shopware',
      installationOptions: {
        optionIcon: '#icon-shopware',
        price: 'Free',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/Shopware.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-1-step.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-2-step.png'
          // }
        ],
        countryList: [],
        category: 'Shopsystem',
        developer: 'payever GmbH',
        languages: 'German, English',
        description: 'With the Shopware Plugin on payever you can accept all payever Checkout payments inside your Shopware shop.',
        appSupport: 'https://getpayever.com/shopsystem/shopware/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.payever.org'
      }
    },
    {
      icon: '#icon-jtl',
      title: 'JTL',
      installationOptions: {
        optionIcon: '#icon-jtl',
        price: 'Free',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/JTL.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-1-step.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-2-step.png'
          // }
        ],
        countryList: [],
        category: 'Shopsystem',
        developer: 'PayPal Inc.',
        languages: 'German, English',
        description: 'With the JTL Plugin on payever you can accept all payever Checkout payments inside your JTL shop.',
        appSupport: 'https://getpayever.com/shopsystem/jtl/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.payever.org'
      }
    },
    {
      icon: '#icon-oxid',
      title: 'OXID',
      optionIcon: '#icon-oxid',
      installationOptions: {
        price: 'Free',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/OXID.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-1-step.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-2-step.png'
          // }
        ],
        countryList: ['DE'],
        category: 'Shopsystem',
        developer: 'payever GmbH',
        languages: 'German, English',
        description: 'With the OXID Plugin on payever you can accept all payever Checkout payments inside your OXID shop.',
        appSupport: 'https://getpayever.com/shopsystem/oxid/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.payever.org'
      }
    },
    {
      icon: '#icon-xt-commerce-bw',
      title: 'xt:Commerce',
      optionIcon: '#icon-xt-commerce-bw',
      installationOptions: {
        price: 'Free',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/xt:Commerce.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-1-step.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-2-step.png'
          // }
        ],
        countryList: ['DE'],
        category: 'Shopsystem',
        developer: 'payever GmbH',
        languages: 'German, English',
        description: 'With the xt:Commerce Plugin on payever you can accept all payever Checkout payments inside your xt:Commerce shop.',
        appSupport: 'https://getpayever.com/shopsystem/xt-commerce/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.payever.org'
      }
    },
    {
      icon: '#icon-shopify',
      title: 'Shopify',
      installationOptions: {
        optionIcon: '#icon-shopify',
        price: 'Free',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/Shopify.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-1-step.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-2-step.png'
          // }
        ],
        countryList: [],
        category: 'Shopsystem',
        developer: 'payever GmbH',
        languages: 'German, English',
        description: 'With the Shopify Plugin on payever you can accept all payever Checkout payments inside your Shopify shop.',
        appSupport: 'https://getpayever.com/shopsystem/shopify/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.payever.org'
      }
    },
    {
      icon: '#icon-dan-domain-bw',
      title: 'DanDomain',
      installationOptions: {
        optionIcon: '#icon-dan-domain-bw',
        price: 'Free',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/DanDomain.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-1-step.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-2-step.png'
          // }
        ],
        countryList: ['DK'],
        category: 'Shopsystem',
        developer: 'payever GmbH',
        languages: 'German, English',
        description: 'With the DanDomain Plugin on payever you can accept all payever Checkout payments inside your DanDomain shop.',
        appSupport: 'https://getpayever.com/shopsystem/dandomain/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.payever.org'
      }
    },
    {
      icon: '#icon-plenty-markets-bw',
      title: 'Plentymarkets',
      installationOptions: {
        optionIcon: '#icon-plenty-markets-bw',
        price: 'Free',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/Plentymarkets.png'
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-1-step.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-2-step.png'
          // }
        ],
        countryList: ['DE'],
        category: 'Shopsystem',
        developer: 'payever GmbH',
        languages: 'German, English',
        description:
          'With the Plentymarkets Plugin on payever you can accept all payever Checkout payments inside your Plentymarkets shop.',
        appSupport: 'https://getpayever.com/help/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.payever.org'
      }
    },
    {
      icon: '#icon-api',
      title: 'API',
      installationOptions: {
        optionIcon: '#icon-api',
        price: 'Free',
        links: [
          {
            linkType: 'img',
            url: './assets/ui-kit/images/installation/API.png',
          },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-1-step.png'
          // },
          // {
          //   linkType: 'img',
          //   url: './assets/ui-kit/images/installation/Checkout-grey-2-step.png'
          // }
        ],
        countryList: [],
        category: 'Shopsystem',
        developer: 'payever GmbH',
        languages: 'German, English',
        description:
          'With the Plentymarkets Plugin on payever you can accept all payever Checkout payments inside your Plentymarkets shop.',
        appSupport: 'https://getpayever.com/developer/api-documentation/',
        website: 'https://www.payever.org',
        pricingLink: 'https://www.payever.org'
      }
    }
  ]
};
