# @pe/products-hub 


## @pe/products

### Development

#### Install

`yarn install`

#### Dev server

* Run `yarn run start`. FYI: It starts proxy for api requests also.
* Open in browser: [http://localhost:8080]().

#### Testing

* Run `yarn run test`.

#### Static analysis

* Run `yarn run lint`.

### Installation

    npm install @pe/products


### Modules


#### products-editor

Raw products editor module consisting of components presenting different steps
of product editing layout.



#### products-list

Raw products list module aimed to display catalog of products
wherever injected into the template via the

    <pf-products-list></<pf-products-list>


#### app-products-editor

Wrapper around the products-editor module from within the same package.
Knows about context-specific things such as: routes, modals etc.
Should be laze loaded via the dispatcher module of the monolith.



#### app-products-list

Wrapper around the products-list module from within the same package.
Is used for integration into the Products section of the website via

    <app-products-list class="pe-bootstrap"
                        data-store-api-prefix=""
                        data-api-prefix="{{ app.request.baseUrl }}/api/rest/v1/"
                        data-url-base="{{ app.request.baseUrl }}"
                        data-slug="{{ business.slug }}"
                        data-back-to-dashboard-url="{{ path('business.homepage', { slug: business.slug }) }}">
    </app-products-list>

In any other place except of the abovementioned Products section
usage of the raw products-list module is assumed.


## @pe/products-picker

This one is obsolete and deprecated, and should be replaced wherever used by products-list ASAP.

### Installation

    npm install @pe/products-picker


### Import and initialization

Module import and initialization:

    import { ProductsPickerModule } from '@pe/products-picker/products-picker.module';

    //API config for server requests
    var config = {
        apiPrefix: 'http://www.payever.local/api/rest/v1',
        slug: 'rk-company-new',
    };

    ProductsPickerModule.setConfig(config);

### Components


#### ProductsPickerComponent

##### Input

`disableSelection?: boolean = false` - disable all selection functionality

`fullscreen?: boolean = true` - fullscreen view mode. Can be usefull, when element need to cover all other elements on page.  

`enablePick?: boolean = false` - enables a `pick` output event and apply some minor changes in styles

`enableAutoPadding?: boolean = false` - enables auto paddings. Useful in ui-layout-content.

##### Output

`select` - emit every time when set of selected items was changed. Payload of event: list of selected items ids (`number[]`).

`pick` - if @Input flag enablePick is set to `true` then every click on store item emits output event with id of this item as a payload

##### Usage in routes:

    import { ProductsPickerComponent } from '@pe/products-picker/products-picker/products-picker.component';    

    const appRoutes: Routes = [
        {
            path: 'products-picker',
            component: ProductsPickerComponent,
        }
    ];

##### Usage in templates:

    <pr-products-picker></pr-products-picker>
