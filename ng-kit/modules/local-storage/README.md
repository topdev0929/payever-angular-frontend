# Local Storage Service module

Provide LocalStorageService

WARNING: Deprecated. Need to use ngx-webstorage instead.

## Usage 

###Import module 

```js
import { LocalStorageModule } from '@pe/ng-kit/modules/local-storage';`

```

```js
@NgModule({
  imports: [
    LocalStorageModule.provide('appName-moduleName'),
    ...
```

###Use service in your Component

```js
import { LocalStorageService } from '@pe/ng-kit/modules/local-storage';`

```

```js
constructor(private localStorageService: LocalStorageService,...){

}
```
### PeLocalStorageService has available methods:
- `setItem(key: string, value: string): void` - save value string to Local Storage with key **pe-appName-moduleName_**+*key*
- `getItem(key: string, prefix?: string): string` - returns value string from Local Storage with key **pe-appName-moduleName_**+*key* or *prefix*+*key*
- `removeItem(key: string): void` - remove from Local Storage key **pe-appName-moduleName_**+*key*
