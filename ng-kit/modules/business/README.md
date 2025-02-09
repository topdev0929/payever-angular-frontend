# Business Service module

Provide BusinessService

## Usage 

###Import module 

```typescript
import { BusinessModule } from '@pe/ng-kit/modules/business';
```

```typescript
@NgModule({
  imports: [
    BusinessModule,
    ...
```

###Use service in your Component

```typescript
import { BusinessService } from '@pe/ng-kit/modules/business';
import { BusinessDataInterface, ... } from '@pe/ng-kit/modules/business';
```

```typescript
constructor(private businessService: BusinessService, ...){
}
```

### BusinessService has available methods:

** `prefix` *- Prefix for API-urls. Usually* **'/api/rest/v1/'**

** `reset` **true** *if need to update cached data*

- `getBusiness(slug: string, prefix: string, reset: boolean = false): Observable<BusinessInterface>` - return Observable object with whole business information **business, channels, currencies, paymentOptions**

- `getBusinessData(slug: string, prefix: string, reset: boolean = false): Observable<BusinessDataInterface>` - return Observable object with business data

- `getBusinessChannels(prefix: string, reset: boolean = false): Observable<BusinessChannelInterface[]>` - return Observable array with localised available Channels reference

- `getBusinessCurrencies(slug: string, prefix: string, reset: boolean = false): Observable<BusinessCurrencyInterface[]>` - return Observable array with localised available business currencies reference

- `getBusinessPaymentOptions(slug: string, prefix: string, reset: boolean = false): Observable<BusinessPaymentOptionInterface[]>` - return Observable array with localised Payment options reference
