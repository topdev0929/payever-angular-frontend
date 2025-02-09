# App Container (utilizes swiper)

## Usage

### Import
```ts
  import { AppContainerModule, AppContainerItem, AppContainerLayout } from '@pe/ng-kit/modules/app-container';
```

### Prepare
```ts
  this.appItems = [
      {
          id: 'icon-db-payments',
          title: 'Payments',
          onSelect: ( event, item ) => {
              console.log('event', event );
              console.log('item', item );
              alert('clicked');
          }
      },
      {
          ...
      },
      ...
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

```

### Template

````html
<pe-app-container
    [containerItems]="appItems"
    [appLayout]="appContainerLayout"
    [isSwiperMobile]="isSwiperMobile">
</pe-app-container>
````

