import { Component } from '@angular/core';

import { DockerItemInterface } from '../../../../../../kit/docker';

@Component({
  selector: 'doc-docker-example',
  templateUrl: 'docker-example.component.html'
})
export class DockerExampleDocComponent {

  dockerItems: DockerItemInterface[] = [
    {
      icon: '#icon-apps-apps',
      title: 'Dashboard',
      active: true,
      onSelect(): void {
        alert('Dashboard');
      }
    },
    {
      icon: '#icon-apps-pos',
      title: 'Points of Sale',
      onSelect(): void {
        alert('Points of Sale');
      }
    },
    {
      icon: '#icon-apps-products',
      title: 'Products',
      onSelect(): void {
        alert('Products');
      }
    },
    {
      icon: '#icon-apps-store',
      title: 'Store',
      count: 5,
      onSelect(): void {
        alert('Store');
      }
    },
    {
      icon: '#icon-apps-orders',
      title: 'Transactions',
      onSelect(): void {
        alert('Transactions');
      }
    },
    {
      icon: '#icon-apps-customers',
      title: 'Customers',
      onSelect(): void {
        alert('Customers');
      }
    },
    {
      icon: '#icon-apps-ad',
      title: 'Ad',
      onSelect(): void {
        alert('Ad');
      }
    },
    {
      icon: '#icon-apps-marketing',
      title: 'Marketing',
      onSelect(): void {
        alert('Marketing');
      }
    }
  ];

  background: string = 'https://stage.payever.de/dist/@pe/ui-kit/images/default-background.jpg';

}
