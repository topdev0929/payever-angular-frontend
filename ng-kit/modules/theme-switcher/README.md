# Import module
```typescript
import { ThemeSwitcherModule } from '@pe/ng-kit/modules/theme-switcher';
```


## ThemeSwitcherComponent
Selector:
- pe-theme-switcher

Params:
- isMobileSelected: boolean

Output:
- onToggled : emits boolean;


### Usage
````ts
import { ThemeSwitcherComponent } from '../../../../../modules/theme-switcher';

handleOnToggle(isToggled: boolean) {
  console.log('handleOnToggle: ', isToggled);
}
````

````html
<pe-theme-switcher
    [isMobileSelected]="true"
    (onToggled)="handleOnToggle($event)"
></pe-theme-switcher>
````
