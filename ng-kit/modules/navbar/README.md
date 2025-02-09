# Import module

```typescript
import { NavbarModule } from '@pe/ng-kit/modules/navbar';

export class YourModule {
  imports: [
    ...
    NavbarModule
    ...
  ]
}
```

### Prepare navbar controls
```ts
  navbarDarkExampleControls: NavbarControlInterface[];

  ngOnInit(): void {
    this.navbarDarkExampleControls = [
      {
        position: 'left',
        type: 'link',
        text: 'Back to stores',
        iconPrepend: 'icon-arrow-left-ios-24'
      } as LinkControlInterface,
      {
        position: 'middle',
        type: 'buttons-group',
        buttons: [
          {
            name: 'desktop',
            icon: 'icon-mac-24',
            active: true
          },
          {
            name: 'mobile',
            icon: 'icon-iphone-24'
          }
        ],
        clickButton: (name: string) => {
          alert('Clicked ' + name);
        }
      } as ButtonsGroupControlInterface,
      {
        position: 'right',
        type: 'link',
        text: 'Save',
        clickLink: () => {
          alert('Save click');
        }
      } as LinkControlInterface,
      {
        position: 'right',
        type: 'link',
        text: 'Discard',
        clickLink: () => {
          alert('Discard click');
        }
      } as LinkControlInterface
    ];
  }
```


### Define template
````html
<pe-navbar [controls]="navbarDarkExampleControls"
           [position]="'default'"
           [color]="'dark'"
>
</pe-navbar>
````
