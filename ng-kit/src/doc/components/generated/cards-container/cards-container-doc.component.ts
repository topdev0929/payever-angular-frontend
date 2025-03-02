import { Component } from '@angular/core';
import {CardsConfig, CardsContainerItem, CardsContainerLayout} from '../../../../kit/cards-container/src';

@Component({
  selector: 'cards-container-doc',
  templateUrl: 'cards-container-doc.component.html',
  styleUrls: ['cards-container-doc.component.scss'],
})
export class CardsContainerDocComponent {
  htmlExample: string =  require('raw-loader!./examples/cards-container-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/cards-container-example-basic.ts.txt');
  cssExample: string =  require('raw-loader!./examples/cards-container-example-basic.css.txt');

  cardItems: CardsContainerItem[] = [];
  cardsContainerLayout: CardsContainerLayout;
  cardConfig: CardsConfig;

  constructor() {
    this.cardsContainerLayout = {
        desktop: {
            slidesPerView: 3,
            slidesPerColumn: 1,
            slidesPerGroup: 3
        },
        tablet: {
            slidesPerView: 2,
            slidesPerColumn: 1,
            slidesPerGroup: 2
        },
        mobile: {
            slidesPerView: 4,
            slidesPerColumn: 3,
            slidesPerGroup: 12
        }
    };

    this.cardItems = [
        {
          id: '2342',
          title: 'Native Union',
          subtitle: '395 products',
          imagePath: 'https://stage.payever.de/dist/@pe/ui-kit/images/commerseos-background.jpg_ed4f73.jpg',
          logoPath: 'https://stage.payever.de/media/cache/business_logo.big.uncropped/34/4d/344d75362126d2b744f91dbbcfb9935a.png',
            actions: [
              {
                  title: 'Open',
                  onSelect: ( event, item, action ) => {
                      
                      
                      
                      alert('Open');
                  }
              },
                {
                    title: 'Delete',
                    onSelect: ( event, item, action ) => {
                        
                        
                        
                        alert('Delete');
                    }
                }
            ],
            onSelect: ( event, item ) => {
                
                
                alert('clicked');
            }
        },
        {
            id: '2342',
            title: 'Native Union',
            subtitle: '395 products',
            imagePath: 'https://stage.payever.de/dist/@pe/ui-kit/images/commerseos-background.jpg_ed4f73.jpg',
            abbr: 'NU'
        },
        {
            id: '2342',
            title: 'Native Union',
            subtitle: '395 products',
            imagePath: 'https://stage.payever.de/dist/@pe/ui-kit/images/commerseos-background.jpg_ed4f73.jpg',
            abbr: 'S'
        },
        {
            id: '2342',
            title: 'Native Union',
            subtitle: '395 products',
            imagePath: 'https://stage.payever.de/dist/@pe/ui-kit/images/commerseos-background.jpg_ed4f73.jpg',
            logoPath: 'https://stage.payever.de/media/cache/business_logo.big.uncropped/34/4d/344d75362126d2b744f91dbbcfb9935a.png'
        },
        {
            id: '2342',
            title: 'Native Union',
            subtitle: '395 products',
            imagePath: 'https://stage.payever.de/dist/@pe/ui-kit/images/commerseos-background.jpg_ed4f73.jpg',
            logoPath: 'https://stage.payever.de/media/cache/business_logo.big.uncropped/34/4d/344d75362126d2b744f91dbbcfb9935a.png'
        }
    ];

    this.cardConfig = {
        add: 'Add a store',
        empty: 'There are no stores',
        addSelect: ( event ) => {
            alert('clicked');
        }
    };
  }
}
