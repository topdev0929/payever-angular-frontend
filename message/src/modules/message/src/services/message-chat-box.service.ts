import { Inject, Injectable } from '@angular/core';

import { EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';

import { PeMessageChatBoxUrlItems } from '../interfaces';
import { PeMessageService } from './message.service';

@Injectable()
export class PeMessageChatBoxService {

  private smallBoxUrlItems: PeMessageChatBoxUrlItems[] = [{
    name: 'Checkout',
    url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/checkout`,
    children: [{
      name: 'Checkout/Payments',
      url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/checkout/{{CHECKOUT_ID}}/panel-payments`,
    }],
  }, {
    name: 'Message',
    url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/message`,
    children: [{
      name: 'Message/Connect',
      url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/message/connect`,
    }, {
      name: 'Message/Integration',
      url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/message/integration`,
    }],
  }, {
    name: 'Site',
    url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/site/{{SITE_ID}}`,
    children: [{
      name: 'Site/Themes',
      url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/site/{{SITE_ID}}/themes`,
      children: [{
        name: 'Site/Themes/Edit',
        url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/site/{{SITE_ID}}/edit`,
      }],
    }, {
      name: 'Site/Settings',
      url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/site/{{SITE_ID}}/settings`,
      children: [{
        name: 'Site/Settings/Password',
        url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/site/{{SITE_ID}}/settings/password`,
      }],
    }],
  }, {
    name: 'Products',
    url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/products`,
    children: [{
      name: 'Products/Add',
      url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/products/list?addExisting=true`,
    }],
  }, {
    name: 'Settings',
    url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/settings`,
    children: [{
      name: 'Settings/Policies',
      url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/settings/policies`,
    }],
  }, {
    name: 'Shop',
    url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/shop/{{SHOP_ID}}`,
    children: [{
      name: 'Shop/Settings',
      url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/shop/{{SHOP_ID}}/settings`,
      children: [{
        name: 'Shop/Settings/Password',
        url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/shop/{{SHOP_ID}}/settings/password`,
      }],
    }, {
      name: 'Shop/Themes',
      url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/shop/{{SHOP_ID}}/themes`,
      children: [{
        name: 'Shop/Themes/Edit',
        url: `${this.environmentConfigInterface.frontend.commerceos}/business/{{BUSINESS_ID}}/shop/{{SHOP_ID}}/edit`,
      }],
    }],
  }];

  constructor(
    private envService: EnvService,
    private peMessageService: PeMessageService,
    @Inject(PE_ENV) private environmentConfigInterface: EnvironmentConfigInterface,
  ) {}

  smallBoxUrls(): PeMessageChatBoxUrlItems[] {
    return this.smallBoxUrlItems;
  }

  linkNormalise(action: string): string {
    let normaliseAction = action;
    if (action.includes('{{BUSINESS_ID}}')) {
      normaliseAction = normaliseAction.replace('{{BUSINESS_ID}}', this.envService.businessId);
    }

    if (action.includes('{{CHECKOUT_ID}}')) {
      normaliseAction = normaliseAction.replace('{{CHECKOUT_ID}}', this.peMessageService.checkoutId);
    }

    if (action.includes('{{SITE_ID}}')) {
      normaliseAction = normaliseAction.replace('{{SITE_ID}}', this.peMessageService.siteId);
    }

    if (action.includes('{{SHOP_ID}}')) {
      normaliseAction = normaliseAction.replace('{{SHOP_ID}}', this.peMessageService.shopId);
    }

    return normaliseAction;
  }
}
