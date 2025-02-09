# Import

```typescript
import { CustomElementWrapperComponent } from '@pe/ng-kit/modules/custom-element-wrapper';

@Component({
  changeDetection: ChangeDetectionStrategy.Default, // Must be Default
  selector: 'test-custom-element',
  templateUrl: './test-custom-element.component.html',
  styleUrls: ['./test-custom-element.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class YourComponent extends CustomElementWrapperComponent {
  
  submitForm$: EventEmitter<void> = new EventEmitter<void>();

  @Input('submitform') set setSubmitForm(value: any) {
    if (this.checkInputEventEmit(value)) {
      this.submitForm$.next(this.parseInputEventEmit(value));
    }
  }

  valueObject: {} = {};
  @Input('valueobject') set setValueObject(value: any) {
    this.valueObject = this.parseInputObject(value);
  }

  @Output('saved') saved: EventEmitter<{}> = new EventEmitter();

  constructor(injector: Injector) {
    super(injector);
  }
  getI18nDomains(): string[] {
    return ['checkout-section-address'];
  }
}
```

## What is custom element?

It looks like angular component but doesn't require typescript, Angular, importing module and etc. 
All is needed is to load js script and place tag to the page.

https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements

## Why do we need custom elements? 

Sometimes we want to share some Angular components between repos.
Usually we put such code to ng-kit. 
But there is some specific code, for example about shipping or checkout logic, that has no sense to keep inside ng-kit.
It's sounds more logical to have shared shipping code inside shipping repo.

And in this case we have 2 options:
- Create SDK inside repo. We use this way for builder and checkout wrapper. 
- Make repo/project to provide custom elements. We use it in shipping and payments. 

## How it works?

For shared repo you need to create separate src directory with separate build process. 
And write code to provide custom element.
Don't forget to fill `innerMicros` section in `deploy/micro.config.json` file.

For code that should load custom element you need 2 things:
- Put custom element to the page
- Wrap it with `<pe-load-micro>`

## Requirements for custom element

- Custom element is just UI element and should not have routing
- It should have it's own localization file (with some root keyword for case if in future you will decide merge it with other custom element)
- Custom element should consist of 2 components: wrapper compoment (to manage loading and parse inputs) and container component (to manage logic).
- Wrapper component should be extended from `CustomElementWrapperComponent`
- Each `@Input()` in wrapper component should be handles as in test example. Different way for each type.
- `@Output()` decorator used same way as usually in Angular
- Template of wrapper component should have container component and show it by this condition: `*ngIf="isReady$ | async"`

## Requirements for loader

- Wrap it with `<pe-load-micro>`. For `<pe-load-micro>` set `[innerMicro]` or `[micro]`. 
What is the difference? The `[micro]` is used for case when whole repo is custom element. 
In this case we don't need to have `innerMicros` section in `deploy/micro.config.json` file. 
For example - all payments repo are made this way.
The `[innerMicro]` is needed when custom element is part of existing app. 
In this case `innerMicros` section required in `deploy/micro.config.json` file.
And in `[innerMicro]` we set both project name and inner micro name.
You can find example in checkout wrapper.
- All inputs must be passed with `attr.` prefix and with `json` pipe for value, for example:
`[attr.value]="data | json"`
- For inputs that are event emitters don't forget also `async` pipe, for example:
`[attr.submit]="submitter$ | async | json"`
- When you generate event for emitter always pass `new TimestampEvent()` or extended event, for example:
`this.submitter$.next(new TimestampEvent());`
