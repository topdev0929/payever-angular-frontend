# Profile Service module

Provide ProfileService

## Usage 

###Import module 

```typescript
import { ProfileModule } from '@pe/ng-kit/modules/profile';
```

```typescript
@NgModule({
  imports: [
    ProfileModule,
    ...
```

###Use service in your Component

```typescript
import { ProfileService } from '@pe/ng-kit/modules/profile';
import { ProfileDataInterface, ... } from '@pe/ng-kit/modules/profile';
```

```typescript
constructor(private profileService: ProfileService, ...){
}
```

### ProfileService has available methods:

** `prefix` *- Prefix for API-urls. Usually* **'/api/rest/v1/'**

** `reset` **true** *if need to update cached data*

- `getProfile(id: string, prefix: string, reset: boolean = false): Observable<ProfileInterface>` - return Observable object with Profile information

- `getProfileSettings(prefix: string, reset: boolean = false): Observable<ProfileSettingsInterface>` - return Observable object with profile settings
