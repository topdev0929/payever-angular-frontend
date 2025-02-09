#App Registry Module

This module need for loading registries from another micros.

##How to use
###Import `AppRegistryModule` for root
```typescript
import { AppRegistryModule } from '@pe/ng-kit/module/app-registry';

@NgModule({
  imports: [
    ... 
    AppRegistryModule.forRoot()
  ]
})
export class AppModule {
  
}
```
###Load registry
```typescript
import { AppRegistryService } from '@pe/ng-kit/module/app-registry';
...
constructor(appRegistryService: AppRegistryService) {
  appRegistryService.getRegistry('./dist_ext/ui-kit-assets/css-hash-table.json')
    .subscribe((result) => console.log(result));
}
```
