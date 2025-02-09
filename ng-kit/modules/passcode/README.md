# Import module
```typescript
import { PasscodeModule } from '@pe/ng-kit/modules/ui-passcode';
```
## PasscodeComponent
Selector:
- pe-passcode

Params:
- codeLength: number
- title: string
- labelCancel: string
- newPasscode: boolean
- labelSave: string
- labelError: string
- onlyPad: boolean
- withDot: boolean
- darkTheme: boolean

Event Emits:
- onDial (emits number[])
- onCancel (emits boolean)
- onSave (emits boolean)
- onReset (emits boolean)
- onRemove (emits number[])

## PasscodeService

Methods:
- buzz

You can subscribe to
- passcodeBuzzedEvent (boolean)


### Usage
````ts
  handleOnDial(passcode: number[]) {
    console.log('handleOnDial', passcode);
  }

  handleOnCancel() {
    console.log('Canceled passcode');
    this.spotlightService.closeSpotlight();
  }
  
  handleOnSave(): void {
    console.log('Saved passcode');
    this.spotlightService.closeSpotlight();
  }
````

````html
<pe-passcode
    title="NATIVE UNION"
    [newPasscode]="false"
    labelError="Wrong passcode"
    labelSave="Save this passcode"
    [codeLength]="6"
    [onlyPad]="false"
    [withDot]="false"
    [darkTheme]="false"
    (onSave)="handleOnSave($event)"
    (onCancel)="handleOnCancel($event)"
    (onReset)="handleOnReset($event)"
    (onRemove)="handleOnRemove($event)"
    (onDial)="handleOnDial($event)"></pe-passcode>
````
