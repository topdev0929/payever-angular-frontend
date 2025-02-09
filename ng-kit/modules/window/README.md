# Window Service module

Provide WindowService

## Usage 

###Import module 

`import { WindowModule } from '@pe/ng-kit/modules/window';`

```
@NgModule({
  imports: [
    WindowModule,
    ...
```

###Use service in your Component
```
isMobile: boolean;
constructor(private windowService: WindowService...){
  this.windowService.isMobile$.subscribe((isMobile: boolean) => this.isMobile = isMobile)
}
```
### PeWindowService has available Observable properties:
- `height$: Observable<number>` - **window.screen.height** property
- `width$: Observable<number>` - **window.screen.width** property
- `availHeight$: Observable<number>` - **window.screen.availHeight** property
- `availWidth$: Observable<number>` - **window.screen.availWidth** property
- `availLeft$: Observable<number>` - **window.screen.availLeft** property
- `availTop$: Observable<number>` - **window.screen.availTop** property
- `isMobile$: Observable<boolean>` - **true** if window width < 720px
- `isTablet$: Observable<boolean>` - **true** if window width > 719px and window width < 960px
- `isDesktop$: Observable<boolean>` - **true** if window width > 959px and window width < 1280px
- `isDesktopLg$: Observable<boolean>` - **true** if window width > 1279px
- `scrollHeight$: Observable<number>` - **window.document.scrollingElement.scrollHeight** property
- `scrollLeft$: Observable<number>` - **window.document.scrollingElement.scrollLeft** property
- `scrollTop$: Observable<number>` - **window.document.scrollingElement.scrollTop** property
- `scrollWidth$: Observable<number>` - **window.document.scrollingElement.scrollWidth** property
- `documentClickEvent$: Observable<Event>` - document Click event
- `messageEvent$: Observable<Event>` Window Message event
