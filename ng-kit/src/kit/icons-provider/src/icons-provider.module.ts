import { NgModule } from '@angular/core';

import * as components from './components';
import { CommonModule } from '@angular/common';

const shared: any[] = [
  components.IconsActivityTabComponent,
  components.IconsAppsComponent,
  components.IconsBannersComponent,
  components.IconsBuilderComponent,
  components.IconsCardsComponent,
  components.IconsCategoriesComponent,
  components.IconsCommerceosComponent,
  components.IconsDashboardComponent,
  components.IconsDockComponent,
  components.IconsEditPanelComponent,
  components.IconsEmbedComponent,
  components.IconsFinanceExpressComponent,
  components.IconsMessengerComponent,
  components.IconsMarketingComponent,
  components.IconsNotificationComponent,
  components.IconsPaymentComponent,
  components.IconsPaymentMethodsComponent,
  components.IconsSantanderFlagsComponent,
  components.IconsSetComponent,
  components.IconsSettingsComponent,
  components.IconsShippingComponent,
  components.IconsSocialComponent,
  components.IconsStatComponent,
  components.IconsStoreBuilderComponent,
  components.IconsTrustAppComponent,
  components.IconsWidgetsComponent,
  components.ImagesPaymentOptionsComponent
];

/**
 * @deprecated
 */
@NgModule({
  imports: [CommonModule],
  declarations: shared,
  exports: shared
})
export class IconsProviderModule {
}
