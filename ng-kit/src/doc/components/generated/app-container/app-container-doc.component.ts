import { Component } from '@angular/core';
import { AppContainerLayout, AppContainerItem } from '../../../../../modules/app-container';


@Component({
  selector: 'app-container-doc',
  templateUrl: 'app-container-doc.component.html',
  styleUrls: ['app-container-doc.component.scss'],
})
export class AppContainerDocComponent {
  htmlExample: string =  require('raw-loader!./examples/app-container-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/app-container-example-basic.ts.txt');
  cssExample: string =  require('raw-loader!./examples/app-container-example-basic.css.txt');

  appItems: AppContainerItem[] = [];
  appContainerLayout: AppContainerLayout;
  isSwiperMobile: boolean = false;

  constructor() {
    this.appContainerLayout = {
        desktop: {
            slidesPerView: 4,
            slidesPerColumn: 2,
            slidesPerGroup: 8
        },
        mobile: {
            slidesPerView: 4,
            slidesPerColumn: 3,
            slidesPerGroup: 12
        }
    };

    this.appItems = [
        {
            id: 'icon-db-payments',
            title: 'Payments',
            onSelect: ( event, item ) => {
                
                
                alert('clicked');
            }
        },
        {
            id: 'icon-db-orders',
            title: 'Orders'
        },
        {
            id: 'icon-db-products',
            title: 'Create order'
        },
        {
            id: 'icon-db-settings',
            title: 'Settings'
        },
        {
            id: 'icon-db-terminal',
            title: 'Create order'
        }
      ];

  }

}
