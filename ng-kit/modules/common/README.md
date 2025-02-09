# Import module to app (root) module

```javascript
import { CommonModule } from '@pe/ng-kit/modules/common';

export class YourAppModule {
    imports: [
        ...
        CommonModule.forRoot()
        ...
    ]
}
```

# Using from ng side
your.module.ts:

```javascript
import { CommonModule } from '@pe/ng-kit/modules/common';

export class YourModule {
    imports: [
        ...
        CommonModule
        ...
    ]
}
```
your.component.ts:

```javascript
import { EventBusService } from '@pe/ng-kit/modules/common';

@Component({ ... })
export class YourComponent {
    constructor(protected eb: EventBusService) {
        eb.emit('my.event', 'some', 'params');
    }
}

```

# Using from marionette side

```javascript
vent.on('my.event', (param1, param2) => {

})

```

# Usage of auth-token service

### Import AuthTokenService to the service with API requests:

```typescript
import { AuthTokenService } from '@pe/ng-kit/modules/common';
```

### Inject service dependency:

```typescript
constructor(private authTokenService: AuthTokenService) {}
```

### Use method addAuthHeader to append to your headers the authorization header:

```typescript
getSomeInfo(): Observable<any> {
    const url: string = 'api/some/path';
    const headers: Headers = new Headers({
        'Content-Type': 'application/json'
    });
    const headersWithToken: Headers = this.authTokenService.addAuthHeader(headers);
    const options: RequestOptionsArgs = new RequestOptions({
        headersWithToken
    });
    return this.http.get(url, options);
}
```

# Usage of LoaderManagerService

### Import LoaderManagerService:

```typescript
import { LoaderManagerService } from '@pe/ng-kit/modules/common';
import { AppAppearanceAnimationInterface } from '@pe/ng-kit/modules/common';
```

### Inject service dependency:

```typescript
constructor(private loaderManagerService: LoaderManagerService) {}
```

### Subscribe for observables in the Root Component:

```typescript
ngOnInit(): void {
     ...
     this.loaderManagerService.showAppLoader$.subscribe((mode: AppLoaderInterface) => {
         this.yourMethod();
     });
     ...
     this.loaderManagerService.showGlobalLoader$.subscribe((show: AppLoaderInterface) => {
         this.yourMethod();
     });
     ...
     this.loaderManagerService.navigateByUrl$.subscribe((url: string) => {
         this.yourMethod();
     });
     ...
}
```

### Use method showGlobalLoader to change loader state:

```typescript
doSmth(): any {
     ...
     this.globalLoaderService.showGlobalLoader(true);
     ...
}
```

### Use method showAppLoader to show/hide animated app-appearance loader:

```typescript
show(): any {
     ...
     this.globalLoaderService.showAppLoader(true, 'url/to/redirect');
     ...
}
```

### Use method navigateByUrl:

```typescript
doSmthElse(): any {
     ...
     this.globalLoaderService.navigateByUrl('url/to/redirect');
     ...
}
```

# Usage of release stage utils

```typescript

import { SHOWROOM_STAGE, STAGING_STAGE, SANDBOX_STAGE, LIVE_STAGE, getReleaseStage } from '@pe/ng-kit/modules/common';

if (getReleaseStage() === LIVE_STAGE) {
  //...
}
```
