# Session Storage Service module

Provide SessionStorageService

WARNING: Deprecated. Need to use ngx-webstorage instead.

## Usage 

###Import module 

```js
import { SessionStorageModule } from '@pe/ng-kit/modules/session-storage';`

```

```js
@NgModule({
  imports: [
    LocalSessionModule.provide('appName-moduleName'),
    ...
```

###Use service in your Component

```js
import { LocalSessionService } from '@pe/ng-kit/modules/session-storage';`

```

```js
constructor(private sessionStorageService: SessionStorageService,...){

}
```
### PeSessionStorageService has available methods:
- `setItem(key: string, value: string): void` - save value string to Session Storage with key **pe-appName-moduleName_**+*key*
- `getItem(key: string, prefix?: string): string` - returns value string from Session Storage with key **pe-appName-moduleName_**+*key* or *prefix*+*key*
- `removeItem(key: string): void` - remove from Session Storage key **pe-appName-moduleName_**+*key*
