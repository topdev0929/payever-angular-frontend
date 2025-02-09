# App Container (utilizes swiper)

## Usage

### Import
```ts
  import { PlatformAppLoader } from '@pe/ng-kit/modules/app-loader';
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

```

### Template

````html
````

