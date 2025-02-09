import { Component } from '@angular/core';

import { DashboardMenuItem } from '../../../../../modules/dashboard-menu';

@Component({
  selector: 'doc-dashboard-menu',
  templateUrl: 'dashboard-menu-doc.component.html',
  styleUrls: ['dashboard-menu-doc.component.scss'],
})
export class DashboardMenuDocComponent {
  htmlExample: string =  require('raw-loader!./examples/dashboard-menu-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/dashboard-menu-example-basic.ts.txt');
  cssExample: string =  require('raw-loader!./examples/dashboard-menu-example-basic.css.txt');

  menuItems: DashboardMenuItem[] = [];
  constructor() {
    this.menuItems = [
      {
        title: 'Help',
        onSelect: ( event, item ) => {
          
          
          alert('Help clicked');
        }
      },
      {
        title: 'Feedback',
        onSelect: ( event, item ) => {
            
            
            alert('Feedback clicked');
        }
      },
      {
        iconId: '#icon-menu-2-24',
        iconNotificationId: '#icon-n-indicator-16',
        iconNotificationCount: 5,
        iconSizeClass: 'size-20',
        onSelect: ( event, item ) => {
          
          
          alert('Icon clicked');
        }
      },
      {
        imagePath: 'https://stage.payever.de/media/cache/business_logo.big.uncropped/34/4d/344d75362126d2b744f91dbbcfb9935a.png',
        // abbr: 'DS',
        onSelect: ( event, item ) => {
          
          
          alert('Avatar clicked');
        }
      }
    ];
  }
}
