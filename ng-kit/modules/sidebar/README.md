# Import module

```typescript
import { ReadMoreModule } from '@pe/ng-kit/modules/read-more';

export class YourModule {
    imports: [
        ...
        ReadMoreModule
        ...
    ]
}
```

# Usage

- peReadMore - add atrribute for enable
- data-readmore - optional text for link, default is "Read more"
- maxlength - optional char limit for cut, default is 55

````html
    <div peReadMore data-readmore="Read more" maxlength="67">
        Your text
    </div>
````
