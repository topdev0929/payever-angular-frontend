# Profile Container (utilizes swiper)

## Usage

### Import
```ts

  import { ProfileContainerModule } from '@pe/ng-kit/modules/profile-container';
  import { ProfileContainerItem } from '@pe/ng-kit//modules/profile-container';
  import { ProfileContainerLayout } from '@pe/ng-kit/modules/profile-container';
  ...

```

### Prepare
```ts
  containerPrivateItem: ProfileContainerItem = {
    id: 1,
    title: 'John Doe',
    type: 'private',
    typeText: 'Private'
  }
  
  this.partnerPrivateItem: ProfileContainerItem[] = [
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
    ...
  ];

  containerItems: ProfileContainerItem[] = [
    {
      id: 1,
      title: 'John Doe',
      type: 'private',
    },
    {
      id: 2,
      title: 'Jane Doe',
      abbr: 'JD',
      type: 'business',
      active: true,
      imagePath: 'https://showroom6.payever.de/media/cache/business_logo.big.uncropped/8b/08/8b0837ad87930af672218ed4af2bb1e8.png',
    },
    {
      id: 2,
      title: 'Jake Doe',
      abbr: 'JD',
      onSelect: (event, item) => {
        console.log('event ', event);
        console.log('item ', item);
        alert('clicked');
      }
    },
    ...
  ];

  profileContainerLayout: ProfileContainerLayout = {
    desktop: {
      slidesPerView: 4,
      slidesPerColumn: 1,
      slidesPerGroup: 3
    },
    mobile: {
      slidesPerView: 2,
      slidesPerColumn: 2,
      slidesPerGroup: 4
    }
  }

```

### Pass ProfileContainerItem array to <pe-profile-container></pe-profile-container> selector (ProfileContainerBreakpointsConfig is optional)

Template
````html
<pe-profile-container
  [containerPrivateItem]="containerPrivateItem"
  [containerItems]="containerItems"
  [profileLayout]="profileContainerLayout"
  [isSwitchedOff]="isSwitchedOff"
  (selectItemEvent)="handleSelectedProfileItem($event)"
  (editItemEvent)="handleEditProfileItem($event)"
  [isSwiperMobile]="isSwiperMobile"
  [containerTheme]="dark | light"
  [showEditButton]="true"
  [textEdit]="'Edit'"
  >
</pe-profile-container>
````

### Handle selectItemEvent event emitted

````ts
  handleSelectedProfileItem($event: SelectedProfileContainerItem) {
    console.log('handleSelectedProfileItem', $event);
  }
````

### Handle selectItemEvent event emitted

````ts
  handleEditProfileItem(event: SelectedProfileContainerItem) {
    console.log('handleEditProfileItem', $event);
  }
````

