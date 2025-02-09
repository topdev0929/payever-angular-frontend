# FullStory Module

Module provides functionality to work with full story plugin:

https://www.fullstory.com

## Usage

Import into you root module:

```
import { FullStoryModule } from "@pe/ng-kit/modules/full-story";

@NgModule({
  imports: [
    FullStoryModule,
    ...
    
```

Then declare service in you root component and add init() call:

```
  constructor(
    private fullStoryService: FullStoryService
  ) {
  }
  ngAfterViewInit() {
    this.fullStoryService.init();
  }
```

FullStory is enabled for LIVE release stage only by default but you are able to force enabled it by passing confugrarion option forceEnable = true to `init()`

After that add full story user identification in authorization/registration part:

```
  // After login/register
  this.fullStoryService.identify(userEmail, userInfo)
```

To identify user we use email instead of ID (it's more usefull).

In official documentation you can find more information about keys available for `userInfo` object:
 
http://help.fullstory.com/develop-js/identify
    
## Fixing problems

In most cases after identify() call in Firefox and Safary current page becomes frozen and CPU gets 100% loading.

To avoid this behaviour you should make following things:

1) Right after `identify()` call you should make full page reloading in 0.5 sec:
 
 ```
    this.fullStoryService.identify(userEmail);
    setTimeout(() => {
      window.location.reload(true);
    }, 500);
 ```

2) You should hide all content or at least all input fields until page finish reloading. 
You check it by using `needForceReload()` call:

```
    <div *ngIf="!fullStoryService.needForceReload()">
      <!-- content -->
    </div>

```
  
