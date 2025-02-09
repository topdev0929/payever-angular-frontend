import type { AllianzFinishModule } from '@pe/checkout/allianz/finish';
import type { InstantPaymentModule } from '@pe/checkout/instant-payment';
import type { IvyFinishModule } from '@pe/checkout/ivy/finish';
import type { IvyFinishModule as IvyFinishV2Module } from '@pe/checkout/ivy/finish/v2';
import type { PaypalModule } from '@pe/checkout/paypal';
import type { SantanderAtModule } from '@pe/checkout/santander-at';
import type { SantanderBeFinishModule } from '@pe/checkout/santander-be/finish';
import type { SantanderDeModule } from '@pe/checkout/santander-de';
import type { SantanderFactDeFinishModule } from '@pe/checkout/santander-de-fact/finish';
import type { SantanderDeInvoiceFinishModule } from '@pe/checkout/santander-de-invoice/finish';
import type { SantanderDePosEditFinishModule } from '@pe/checkout/santander-de-pos/edit-finish';
import type { SantanderDePosFinishModule } from '@pe/checkout/santander-de-pos/finish';
import type { SantanderDkFinishModule } from '@pe/checkout/santander-dk/finish';
import type { SantanderFiModule } from '@pe/checkout/santander-fi';
import type { SantanderNlModule } from '@pe/checkout/santander-nl';
import type { SantanderNoInvoiceModule } from '@pe/checkout/santander-no-invoice';
import type { SantanderNoFinishModule } from '@pe/checkout/santander-no/finish';
import type { SantanderSeFinishModule } from '@pe/checkout/santander-se/finish';
import type { SantanderUkFinishModule } from '@pe/checkout/santander-uk/finish';
import type { SofortModule } from '@pe/checkout/sofort';
import type { StripeDirectdebitFinishModule } from '@pe/checkout/stripe-directdebit/finish';
import type { StripeIdealFinishModule } from '@pe/checkout/stripe-ideal/finish';
import type { StripeWalletFinishModule } from '@pe/checkout/stripe-wallet/finish';
import type { StripeFinishModule } from '@pe/checkout/stripe/finish';
import type { SwedbankFinishModule } from '@pe/checkout/swedbank/finish';
import type { PaymentMethodEnum, PaymentMethodVariantEnum } from '@pe/checkout/types';
import type { WiretransferModule } from '@pe/checkout/wiretransfer';
import type { ZiniaBNPLFinishModule } from '@pe/checkout/zinia-bnpl/v1/finish';
import type { ZiniaBNPLFinishModuleV2 } from '@pe/checkout/zinia-bnpl/v2/finish';
import type { ZiniaBNPLFinishModuleV3 } from '@pe/checkout/zinia-bnpl/v3/finish';
import type { ZiniaInstallmentsV1FinishModule } from '@pe/checkout/zinia-installments/v1/finish';
import type { ZiniaInstallmentsV2FinishModule } from '@pe/checkout/zinia-installments/v2/finish';

export type PaymentModule = typeof InstantPaymentModule
| typeof AllianzFinishModule
| typeof IvyFinishModule
| typeof IvyFinishV2Module
| typeof ZiniaBNPLFinishModule
| typeof ZiniaBNPLFinishModuleV2
| typeof ZiniaBNPLFinishModuleV3
| typeof PaypalModule
| typeof SantanderAtModule
| typeof SantanderBeFinishModule
| typeof SantanderDeModule
| typeof SantanderDeInvoiceFinishModule
| typeof SantanderDePosFinishModule
| typeof SantanderDePosEditFinishModule
| typeof SantanderDkFinishModule
| typeof SantanderFactDeFinishModule
| typeof SantanderFiModule
| typeof SantanderNlModule
| typeof SantanderNoFinishModule
| typeof SantanderNoInvoiceModule
| typeof SantanderSeFinishModule
| typeof SantanderUkFinishModule
| typeof SofortModule
| typeof StripeIdealFinishModule
| typeof StripeFinishModule
| typeof StripeDirectdebitFinishModule
| typeof StripeWalletFinishModule
| typeof SwedbankFinishModule
| typeof WiretransferModule
| typeof ZiniaInstallmentsV1FinishModule
| typeof ZiniaInstallmentsV2FinishModule;

export type FinishSelectorConfig = {
  [key in PaymentMethodEnum]: {
    [variant in PaymentMethodVariantEnum]?: {
      import: (editMode?: boolean) => Promise<PaymentModule>;
    }
  }
};
