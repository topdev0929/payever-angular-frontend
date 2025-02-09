# App Container (utilizes swiper)

## Usage

### Import
```ts
  import {CardsConfig, CardsContainerItem, CardsContainerLayout} from '@pe/ng-kit/modules/cards-container';
```

### Prepare
```ts
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
                  console.log('event', event );
                  console.log('item', item );
                  console.log('action', action );
                  alert('Open');
              }
          },
            {
                title: 'Delete',
                onSelect: ( event, item, action ) => {
                    console.log('event', event );
                    console.log('item', item );
                    console.log('action', action );
                    alert('Delete');
                }
            }
        ],
        onSelect: ( event, item ) => {
            console.log('event', event );
            console.log('item', item );
            alert('clicked');
        }
    },
    {
        ...
    }
  ];
    
  this.cardConfig = {
      add: 'Add a store',
      empty: 'There are no stores',
      addSelect: ( event ) => {
          alert('clicked');
      }
    };
  
  this.cardsContainerLayout = {
        desktop: {
            slidesPerView: 4,
            slidesPerColumn: 1,
            slidesPerGroup: 4
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

```

### Template

````html
<pe-app-container
    [containerItems]="appItems"
    [appLayout]="appContainerLayout"
    [isSwiperMobile]="isSwiperMobile">
</pe-app-container>
````

