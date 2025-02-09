import { CommonModule } from '@angular/common';
import { ComponentFactory, ComponentFactoryResolver, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ButtonModule } from '@pe/button';
import { BusinessFormModule } from '@pe/entry/business-form';
import {
  EntrySharedModule,
  PartnerResolver,
} from '@pe/entry/shared';
import { I18nModule } from '@pe/i18n';
import {
  PebMessagesModule,
} from '@pe/ui';
import { WindowEventsService } from '@pe/window';

import { RegistrationComponent } from '../registration.component';
import { BusinessRegistrationResolver } from '../resolvers';

import {
  BusinessRegistrationComponent,
  DefaultBusinessRegistrationComponent,
  DynamicBusinessRegistrationComponent,
} from './components';


const routes: Routes = [
  {
    path: '',
    resolve: {
      businessRegistrationData: BusinessRegistrationResolver,
    },
    children: [
      {
        path: '',
        component: RegistrationComponent,
        data: { type: 'business' },
        resolve: { partner: PartnerResolver },
      },
      {
        path: 'app/:app',
        component: RegistrationComponent,
        data: { type: 'business' },
        resolve: { partner: PartnerResolver },
      },
      {
        path: 'social',
        component: BusinessRegistrationComponent,
        resolve: { partner: PartnerResolver },
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    PebMessagesModule,
    I18nModule.forChild(),
    ButtonModule,
    EntrySharedModule,
    BusinessFormModule,
  ],
  declarations: [
    BusinessRegistrationComponent,
    DefaultBusinessRegistrationComponent,
    DynamicBusinessRegistrationComponent,
  ],
  providers: [WindowEventsService],
})
export class RegistrationBusinessModule {
  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  public resolveEntryBusinessComponent(): ComponentFactory<BusinessRegistrationComponent> {
    return this.componentFactoryResolver.resolveComponentFactory(BusinessRegistrationComponent);
  }
}
