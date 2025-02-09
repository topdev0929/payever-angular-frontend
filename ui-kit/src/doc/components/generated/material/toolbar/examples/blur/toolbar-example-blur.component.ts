import { Component } from '@angular/core';

interface IconList {
  icon: string;
  title: string;
  count?: number;
  active?: boolean;
}

@Component({
  selector: 'doc-toolbar-example-blur',
  templateUrl: './toolbar-example-blur.component.html'
})
export class ToolbarExampleBlurComponent {
  showDashboard: boolean = false;

  iconsList: IconList[] = [
    {
      icon: '#icon-apps-apps',
      title: 'Dashboard',
      count: 10
    },
    {
      icon: '#icon-apps-pos',
      title: 'Points of Sale'
    },
    {
      icon: '#icon-apps-products',
      title: 'Products'
    },
    {
      icon: '#icon-apps-store',
      title: 'Store'
    },
    {
      icon: '#icon-apps-orders',
      title: 'Transactions',
      active: true
    },
    {
      icon: '#icon-apps-customers',
      title: 'Customers'
    },
    {
      icon: '#icon-apps-ad',
      title: 'Ad'
    },
    {
      icon: '#icon-apps-marketing',
      title: 'Marketing'
    },
    {
      icon: '#icon-apps-statistics',
      title: 'Statistics'
    },
    {
      icon: '#icon-apps-messenger',
      title: 'Messenger'
    },
    {
      icon: '#icon-apps-coupons',
      title: 'Coupons'
    },
    {
      icon: '#icon-apps-legal',
      title: 'Legal'
    },
    {
      icon: '#icon-apps-shipping',
      title: 'Shipping'
    },
    {
      icon: '#icon-apps-settings',
      title: 'Settings'
    }
  ];

  toggleDashboard(): void {
    this.showDashboard = (this.showDashboard) ? false : true;
  }
}
