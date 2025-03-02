import { Component } from '@angular/core';
import {
  ProfileContainerLayout,
  ProfileContainerItem,
  ProfileContainerThemeType
} from '../../../../../modules/profile-container';
import {
    AppContainerLayout,
    AppContainerItem
} from '../../../../../modules/app-container';
import {CardsConfig, CardsContainerItem, CardsContainerLayout} from '../../../../kit/cards-container/src';

@Component({
  selector: 'doc-profile-container',
  styleUrls: ['profile-container-doc.component.scss'],
  templateUrl: 'profile-container-doc.component.html'
})
export class ProfileContainerDocComponent {
  htmlExample: string =  require('raw-loader!./examples/profile-container-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/profile-container-example-basic.ts.txt');

  containerItems: ProfileContainerItem[] = [];
  containerPrivateItem: ProfileContainerItem;
  partnerPrivateItem: ProfileContainerItem[] = [];
  profileContainerLayout: ProfileContainerLayout;
  isSwitchedOff: boolean = false;
  isSwiperMobile: boolean = false;
  isSwiperTablet: boolean = false;
  containerTheme: ProfileContainerThemeType = 'light';

  appItems: AppContainerItem[] = [];
  appContainerLayout: AppContainerLayout;

  cardItems: CardsContainerItem[] = [];
  cardsContainerLayout: CardsContainerLayout;
  cardConfig: CardsConfig;

  constructor() {
    this.profileContainerLayout = {
      desktop: {
        slidesPerView: 4,
        slidesPerColumn: 1,
        slidesPerGroup: 3
      },
      mobile: {
        slidesPerView: 2,
        slidesPerColumn: 2,
        slidesPerGroup: 2
      }
    };

    this.containerPrivateItem = {
      id: 1,
      title: 'John Doe',
      typeText: 'Private'
    };

    this.partnerPrivateItem = [
      {
          id: 2,
          title: 'Jane Doe',
          abbr: 'JD',
          typeText: 'Partner',
          imagePath: 'https://showroom6.payever.de/media/cache/business_logo.big.uncropped/8b/08/8b0837ad87930af672218ed4af2bb1e8.png'
      },
      {
          id: 3,
          title: 'Coca Cola',
          typeText: 'Partner',
          abbr: 'CC',
          active: true
      }
    ];

    this.containerItems = [
      {
        id: 2,
        title: 'Jane Doe',
        abbr: 'JD',
        typeText: 'Business',
        imagePath: 'https://showroom6.payever.de/media/cache/business_logo.big.uncropped/8b/08/8b0837ad87930af672218ed4af2bb1e8.png'
      },
      {
        id: 3,
        title: 'Coca Cola',
        typeText: 'Business',
        abbr: 'CC'
      },
      {
        id: 4,
        title: 'Jake Doe',
        abbr: 'JD',
        typeText: 'Business',
        onSelect: ( event, item ) => {
          
          
          alert('clicked');
        }
      },
      {
        id: 5,
        title: 'John Doe',
        abbr: 'JD',
        typeText: 'Business',
        imagePath: 'https://showroom6.payever.de/media/cache/business_logo.big.uncropped/42/9a/429a2ee4f30392406d93d81d305d8631.jpg'
      },
      {
        id: 6,
        title: 'Jane Doe',
        abbr: 'JD',
        typeText: 'Business',
        imagePath: 'https://showroom6.payever.de/media/cache/business_logo.big.uncropped/8b/08/8b0837ad87930af672218ed4af2bb1e8.png'
      },
      {
        id: 7,
        title: 'Coca Cola',
        abbr: 'CC',
        typeText: 'Business',
        imagePath: 'https://showroom6.payever.de/media/cache/business_logo.big.uncropped/42/9a/429a2ee4f30392406d93d81d305d8631.jpg'
      },
      {
        id: 8,
        title: 'Jake Doe',
        abbr: 'JD',
        typeText: 'Business',
        imagePath: 'https://showroom6.payever.de/media/cache/business_logo.big.uncropped/42/9a/429a2ee4f30392406d93d81d305d8631.jpg'
      },
      {
        id: 2,
        title: 'Jane Doe',
        abbr: 'JD',
        typeText: 'Business',
        imagePath: 'https://showroom6.payever.de/media/cache/business_logo.big.uncropped/8b/08/8b0837ad87930af672218ed4af2bb1e8.png'
      },
      {
        id: 3,
        title: 'Coca Cola',
        abbr: 'CC',
        typeText: 'Business',
        active: true
      },
      {
        id: 4,
        title: 'Jake Doe',
        abbr: 'JD',
        typeText: 'Business',
        onSelect: ( event, item ) => {
          
          
          alert('clicked');
        }
      },
      {
        id: 5,
        title: 'John Doe',
        abbr: 'JD',
        typeText: 'Business',
        imagePath: 'https://showroom6.payever.de/media/cache/business_logo.big.uncropped/42/9a/429a2ee4f30392406d93d81d305d8631.jpg'
      },
      {
        id: 6,
        title: 'Jane Doe',
        abbr: 'JD',
        typeText: 'Business',
        imagePath: 'https://showroom6.payever.de/media/cache/business_logo.big.uncropped/8b/08/8b0837ad87930af672218ed4af2bb1e8.png'
      },
      {
        id: 7,
        title: 'Coca Cola',
        abbr: 'CC',
        typeText: 'Business',
        imagePath: 'https://showroom6.payever.de/media/cache/business_logo.big.uncropped/42/9a/429a2ee4f30392406d93d81d305d8631.jpg'
      }
    ];

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

  onToggleContainerSwitch(): void {
    this.isSwitchedOff = !this.isSwitchedOff;
  }

  onToggleIsMobile(): void {
    this.isSwiperMobile = !this.isSwiperMobile;
  }

  onToggleTheme(): void {
    this.containerTheme = this.containerTheme === 'dark' ? 'light' : 'dark' ;
  }

  handleSelectedProfileItem(event: {event: MouseEvent, item: ProfileContainerItem}): void  {
      
  }

  handleEditProfileItem(event: {event: MouseEvent, item: ProfileContainerItem}): void  {
      
  }
}
