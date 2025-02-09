# Modules with tools for micro frontends.

# Import module

```javascript
import { MicroModule } from '@pe/ng-kit/modules/micro';

export class YourModule {
    imports: [
        ...
        MicroModule
        ...
    ]
}
```

# Micro service addon component - component that allows to add other FE micros to your app via iframe and takes care about iframe size.

Your template:

```html

<pe-micro-addon [url]='myIframeUrl'></pe-micro-addon>

```
