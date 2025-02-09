# Import module
```typescript
import { LayoutModule } from '@pe/ng-kit/modules/layout';
```
## LayoutApp component
Selector:
- pe-layout-app

Params:
- backgroundImageUrl: string; (url or require('../../../assets/img/background_jpg_ed4f73.jpg'), you can also not specify background image )
- noPadding: boolean (Default: fasle);
- noHeaderBorder: boolean (Default: false);
- fullView: boolean; (Default: false, if you want old no rounded border style view, with solid white bg)
- headerTransparent: boolean;
- showHeader: boolean; is header show
- showToolbar: boolean; is toolbar show

### Usage
````html
<pe-layout-app
  [backgroundImageUrl]="'http://cit.h-cdn.co/assets/17/01/980x695/1483528451-central-park.jpg'"
  >
  <pe-layout-header header></pe-layout-header>
  <!-- transclusion inside layout-app -->
  <h1>Sample Header</h1>
  <h3>Sample Header</h3>
  <p>Sample text</p>
  <a class="btn btn-primary">Sample btn</a>
</pe-layout-app>
````

## LayoutHeader
Selector:
- pe-layout-header

**Params:**
- notTransparent: boolean (Default: fasle);
- showBackButton: show/hide Back button on left column (Default: true). Applied for custom and native buttons;
- defaultBackLinkHref: string (Default: '/'). Used when Back button has static destination
- defaultBackLinkTitle: string (Default: '').


Has native back button in left column. It is shown by default. To hide Back button use [showBackButton] param.

### Setup Back link 

We can setup link and title of Back button for every route. For this we should use `data` property of route settings.
Use these params:
- backRoute - array of string that will be passed to `router.navigate` method. It is relative to route where you write it. For example `['../']`
- backTitle - string. Will be shown in Back button when user will activate route.

**Code example**
```
Some route settings...
{
    path: 'route-path',
    data: {
        backRoute: ['../'], // relative to 'route-path'
        backTitle: 'Back to dashboard'
    },
    children: [...]
}
``` 
 
**How it works**

`pe-layout-header` creates subscription for `NavigationEnd` events. It searches current activated route and its `data`.
If `backRoute` and/or `backTitle` is present in `data` it used in header.
Otherwise `defaultBackLink` and `defaultBackLinkTitle` input params of component are used.


###Custom Back button

We are able to create custom Back button. For this we just need to create element with [col-left] attribute inside `pe-layout-header`

**Usage**

With native Back button (without [col-left] element):
````html
  <pe-layout-header>
    <div col-center>
      <div class="modal-title">
        <svg class="icon icon-24"><use xlink:href="#icon-checkbox-checked-24"></use></svg>
      </div>
    </div>
    <div col-right>
      right area
    </div>
  </pe-layout-header>
````

With custom Back button: 
````html
  <pe-layout-header>
    <div col-left>
      <a>
        <svg class="icon icon-24"><use xlink:href="#icon-dashboard-24"></use></svg>
      </a>
    </div>
    <div col-center>
      <div class="modal-title">
        <svg class="icon icon-24"><use xlink:href="#icon-checkbox-checked-24"></use></svg>
      </div>
    </div>
    <div col-right>
      right area
    </div>
  </pe-layout-header>
````

## LayoutService
can subscribe to
- layoutClosedEvent
- sidebarToggleEvent

Methods:
- closeLayout();
- toggleSidebar()


## LayoutTabset
Please use LayoutTabset inside LayoutApp
Note: this component has `router-outlet`.

Selector:
- pe-layout-tabset


````html
<pe-layout-app>
  <pe-layout-header header [notTransparent]="true">
    ...
  </pe-layout-header>

  <!-- transclusion inside layout-app -->
  <pe-layout-tabset>
    ...
  </pe-layout-tabset>
</pe-layout-app>
````

## LayoutTab
Please use LayoutTab inside LayoutTabset

Selector:
- pe-layout-tab

Params:
- link: string;
- svgIcon: string;
- pngIcon: require('./image.png')
- noIconShadow: boolean

````html
<pe-layout-app>
  <pe-layout-header header [notTransparent]="true">
    ...
  </pe-layout-header>

  <!-- transclusion inside layout-app -->
  <pe-layout-tabset>
    <pe-layout-tab
      link="/layout-content"
      svgIcon="#icon-settings-builtin-applications">
    </pe-layout-tab>
    ...
  </pe-layout-tabset>
</pe-layout-app>
````

## LayoutContent
Please use LayoutContent inside component that you will load with a Tabset

Selector:
- pe-layout-content

Params:
- bodyTransparent: boolean;
- sidebarTransparent: boolean;
- showSidebar: boolean; is sidebar show


````html
<pe-layout-content>
  ... main trasclusion
  <pe-layout-sidebar sidebar>
    ... sidebar transclusion
  </pe-layout-sidebar>
</pe-layout-content>
````


## LayoutSidebar
Please use LayoutSidebar inside LayoutContent

Selector:
- pe-layout-sidebar


````html
  <pe-layout-sidebar>
    <h4 class="text-center">Collapsable</h4>
    <accordion [closeOthers]="true" class="ui-accordion ui-sidebar-accordion">
      <accordion-group heading="This is a Heading">
        <form class="form-table">
            <p class="caption-2">Location</p>
            <fieldset>
              <div class="clearfix">
                <div class="row">
                  <div class="col-xs-12">
                      <input class="form-control" id="exampleInputFirst" placeholder="Country, City or ZIP code" type="email">
                      <label>Country, City or ZIP code</label>
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <div class="clearfix">

                <div class="col-xs-6">
                  <select class="form-control" id="ft06" placeholder="Select field" tabindex="8">
                      <option value="">Select field</option>
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                  </select>
                  <label for="ft06">Select field</label>
                </div>
                <div class="col-xs-6">
                  <select class="form-control" id="ft06" placeholder="Select field" tabindex="8">
                      <option value="">Select field</option>
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                  </select>
                  <label for="ft06">Select field</label>
                </div>

              </div>
            </fieldset>
        </form>
      </accordion-group>
      <accordion-group heading="This is a Heading">
        This content is straight in the template.
      </accordion-group>
      <accordion-group heading="This is a Heading">
        This content is straight in the template.
      </accordion-group>
    </accordion>

    <h4 class="text-center">Audience</h4>

    <form class="form-table">
        <p class="caption-2">Location</p>
        <fieldset>
          <div class="clearfix">
            <div class="row">
              <div class="col-xs-12">
                  <input class="form-control" id="exampleInputFirst" placeholder="Country, City or ZIP code" type="email">
                  <label>Country, City or ZIP code</label>
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <div class="clearfix">

            <div class="col-xs-6">
              <select class="form-control" id="ft06" placeholder="Select field" tabindex="8">
                  <option value="">Select field</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
              </select>
              <label for="ft06">Select field</label>
            </div>
            <div class="col-xs-6">
              <select class="form-control" id="ft06" placeholder="Select field" tabindex="8">
                  <option value="">Select field</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
              </select>
              <label for="ft06">Select field</label>
            </div>

          </div>
        </fieldset>
    </form>

    <h4 class="text-center">Edit Ad</h4>
    <form class="form-table">
        <fieldset>
          <div class="clearfix">

            <div class="row">
              <div class="col-xs-12">
                <textarea class="form-control" id="ft11" placeholder="Textarea field" rows="3" tabindex="13"></textarea>
                <label for="ft11">Textarea field</label>
              </div>

              <div class="col-xs-12">
                  <input class="form-control" id="exampleInputFirst" placeholder="Title" type="email">
                  <label>Title</label>
              </div>

              <div class="col-xs-12">
                <textarea class="form-control" id="ft11" placeholder="Textarea field" rows="3" tabindex="13"></textarea>
                <label for="ft11">Textarea field</label>
              </div>
            </div>

          </div>
        </fieldset>
    </form>

    <h4 class="text-center">Customers</h4>
    <ul class="nav nav-sidebar-blocks">
      <li>
        <a class="row" href="#">
          <span class="col-xs-10">Edit Ad</span>
          <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-arrow-right-2-16"></use></svg></span>
        </a>
      </li>
    </ul>

    <ul class="nav nav-sidebar-blocks">
      <li class="title caption-2">Content</li>
      <li>
        <a class="row" href="#">
          <span class="col-xs-6">Price</span>
          <span class="col-xs-4 text-right text-secondary">$699</span>
          <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-arrow-right-2-16"></use></svg></span>
        </a>
      </li>
      <li>
        <a class="row" href="#">
          <span class="col-xs-10">Audience</span>
          <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-plus-16"></use></svg></span>
        </a>
        <dl class="dl-horizontal">
          <dt>Gender</dt>
          <dd>Woman</dd>
          <dt>Age</dt>
          <dd>24 to 65+</dd>
          <dt>Interests</dt>
          <dd>Furniture Home & Deco Gadgets</dd>
        </dl>
      </li>
      <li>
        <a class="row" href="#">
          <span class="col-xs-6">Inventory SKU</span>
          <span class="col-xs-4 text-right text-secondary">3</span>
          <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-arrow-right-2-16"></use></svg></span>
        </a>
      </li>
      <li>
        <a class="row" href="#">
          <span class="col-xs-6">Selling channels</span>
          <span class="col-xs-4 text-right text-secondary">3</span>
          <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-arrow-right-2-16"></use></svg></span>
        </a>
      </li>
    </ul>
    <p class="small">Create your first Ad to skyrocket your product sales on your Shop.</p>

    <ul class="nav nav-sidebar-blocks">
      <li class="title caption-2">Products & Contents</li>
      <li>
        <a class="row" href="#">
          <span class="col-xs-1"><svg class="icon icon-24"><use xlink:href="#icon-dots-v-24"></use></svg></span>
          <span class="col-xs-9">Dock for Apple Watch</span>
          <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-arrow-right-2-16"></use></svg></span>
        </a>
      </li>
      <li>
        <a class="row" href="#">
          <span class="col-xs-1"><svg class="icon icon-24"><use xlink:href="#icon-dots-v-24"></use></svg></span>
          <span class="col-xs-9">Dock Collection</span>
          <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-arrow-right-2-16"></use></svg></span>
        </a>
      </li>
    </ul>
    <p>
      <button type="button" class="btn btn-link">+ Add products</button>
    </p>
  </pe-layout-sidebar>
````
