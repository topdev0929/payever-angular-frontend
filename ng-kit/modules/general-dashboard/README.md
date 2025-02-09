# Import module

```typescript
import { GeneralDashboardModule, GeneralDashboardItemInterface, GeneralDashboardSubItemInterface } from '@pe/ng-kit/general-dashboard';
```

# Usage

Create items list for the general dashboard:

```typescript
const listSubItems1: GeneralDashboardSubItemInterface = [
    {
        imgSrc: '../../../assets/img/Bender-300x300.jpg',
        name: 'Credit Card',
        description: 'Are very welcome!',
        btnGroup: {
          btnName: 'Edit',
          btnClickHandler: () => {
            alert('Clicked');
          },
          btnDropdown: [
            {
              btnName: 'Action',
              btnClickHandler: () => {
                alert('Action button clicked');
              }
            },
            {
              btnName: 'Other action link',
              btnClickHandler: () => {
                alert('Other action link clicked');
              }
            }
          ]
        },
        lbReadMore: 'Read more',
        switcherChangeHandler: () => {
          alert('switcher changed!');
        }
    },
    {
        imgSrc: '../../../assets/img/Bender-300x300.jpg',
        name: 'Santander Installments',
        description: 'Are very welcome!',
        btnGroup: {
          btnName: 'Edit'
        },
        lbReadMore: 'Read more',
    }
];

const listSubItems2: GeneralDashboardSubItemInterface = [
    {
      imgSrc: '../../../assets/img/Bender-300x300.jpg',
      name: 'Credit Card',
      description: 'Are very welcome!',
      btnGroup: {
        btnName: 'Open',
        btnClickHandler: () => {
          alert('Opened!');
        }
      },
      switcher: {
        isChecked: false,
        switcherChangeHandler: (event: Event) => {
          alert('Hello!');
        }
      },
      lbReadMore: 'Read more'
    },
    {
      imgSrc: '../../../assets/img/Bender-300x300.jpg',
      name: 'Credit Card',
      description: 'Are very welcome!',
      btnGroup: {
        btnName: 'Open'
      },
      switcher: {
        isChecked: false
      },
      lbReadMore: 'Read more',
      isDisabled: true
    }
];

const dashboardItems: GeneralDashboardItemInterface = [
    {
      title: 'Get started',
      description: 'Description',
      btnsMoreLess: {
        btnMoreName: 'More',
        btnLessName: 'Less'
      },
      subItems: listSubItems1
    },
    {
      title: 'Run',
      description: 'Description',
      subItems: listSubItems2
    }
];
```

Add the general dashboard:

````html
<pe-general-dashboard [dashboardItems]="dashboardItems"></pe-general-dashboard>
````
