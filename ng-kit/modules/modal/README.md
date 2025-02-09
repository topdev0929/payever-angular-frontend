# Modals

Regular modals. The idea is to wrap template to <pe-modal>...</pe-modal> to make component look like modal.

## Usage

### Import module

```ts
import { UiModalModule } from '@pe/ng-kit/modules/modal';

@NgModule({
  imports: [
    UiModalModule,
    ...
```

### Declare method to navigate on modal close

```ts
@Component({
  templateUrl: 'first.component.html',
})
export class FirstComponent {
 constructor(
   private route: ActivatedRoute,
   private router: Router,
 ) {
 }

 private back() {
   this.router.navigate(['..'], {relativeTo: this.route});
 }
}

```

### Wrap component template 

```html
<pe-modal (onClose)="back()">
  <h2>First modal</h2>
  <p>One fine body…</p>
</pe-modal>
```

## Configuration

### View presets

The idea is to set name of base preset via `[baseViewConfig]` and redeclare/extend it via `[viewConfig]`:
 
```html
<pe-modal
  [baseViewConfig]="'small'"
  [viewConfig]="{classes: {modalBody : 'zero-padding'}}"
  ...>
</pe-modal>
```

List of all view presets:

https://gitlab.devpayever.com/frontend/ng-kit/blob/master/modules/modal/components/modal-presets.ts

### Button presets

The idea is to set name of base preset via `[baseButtons]` and redeclare/extend it via `[buttons]`:
 
```html
<pe-modal
  [baseButtons]="'close'"
  [buttons]="buttons"
  ...>
</pe-modal>
```

This way you can add classes/styles, hide/show header and close button, etc.

List of all button presets:

https://gitlab.devpayever.com/frontend/ng-kit/blob/master/modules/modal/components/modal-presets.ts

Important to know that button titles are not translated. So you need to set at least button title `[buttons]`: 

```typescript
  private buttons: UiModalButtonListInterface = {
    'close': {
      title: translator.translate('buttons.close'),
    },
  };
```

### How to emit close event

There are 2 ways to emit. First (preferred) one is to declare emitter and pass it to <pe-modal>

```typescript
  private hider: Subject<boolean> = new Subject();
  private hide() {
    this.hider.next(true);
  }
```

```html
<pe-modal
  [doHide]="hider"
  ...>
</pe-modal>
```
Second way is to use

```typescript
  @ViewChild("modal") modal: UiModalComponent;
  private hide() {
    this.modal.hide();
  }
```

```html
<pe-modal
  #modal ...>
</pe-modal>
```

### Set header or title content for large modal

Use `header` attribute:

```html
<pe-modal
  #modal
  [type]="'large'"
  (onClose)="back()">

  <div header class="row">
    <div class="col-sm-3 col-xs-6">
      <button class="btn btn-link btn-lg btn-inline">
        <svg class="icon icon-16"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-plus-16"></use></svg>
        <span>New product</span>
      </button>
    </div>
    <div class="col-sm-6 hidden-xs text-center"><div class="modal-title subheading text-secondary">Modal title</div></div>
    <div class="col-sm-3 col-xs-6 text-right">
      <button class="btn btn-lg btn-link btn-inline" data-dismiss="modal" type="button">Cancel</button>
    </div>
  </div>

  <div title>
    <a class="btn btn-default btn-link btn-inline" href="#">
      <svg class="icon icon-16"><use xmlns:xlink="http://www.w3.org/1999/xlink" [attr.xlink:href]="'#icon-open-new-16'"></use></svg>
      <span>Title App</span>
    </a>
  </div>
  
  <h2>First modal</h2>
  <p>One fine body…</p>
</pe-modal>
```

### Modal over modal

To show modal over modal always put `<route-outlet>` after `</pe-modal>`

```html
<pe-modal (onClose)="back()">
  <h2>First modal</h2>
  <p>One fine body…</p>
  <button (click)="gotoSecond()">Show second modal</button>
</pe-modal>

<router-outlet></router-outlet>
```

## Config

* onClose: EventEmitter; // Close modal event handler
* doHide?: Subject<boolean>; // Close modal emitter
* baseViewConfig?: UiModalViewConfigPresetName; // Name of base view preset. Default: `small`
* viewConfig?: UiModalViewConfigInterface; // View config to be merged with base view preset
* baseButtons?: UiModalButtonListPresetName; // Name of base buttons preset. Default: `close`
* buttons?: UiModalButtonListInterface; // Buttons config to be merged with base view preset
* showLoading?: boolean; // default: `false`
* disableHide?: boolean; // Emit onClose() but do not hide modal. Helpfull if confirmation dialog is needed before closing. default: `false`
