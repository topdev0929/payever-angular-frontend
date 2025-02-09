# SearchResults module

Search results group.

## Usage

### Import module
```ts
import { SearchResultsModule } from '@pe/ng-kit/modules/search-results';
import { SearchResultsGroup } from '@pe/ng-kit/modules/search-results';

@NgModule({
  imports: [
    SearchResultsModule,
    ...
```

### Prepare search results array
```
searchResults: SearchResultsGroup[] = [
    {
        title: 'Applications', // title of group
        items: [ // array of items in group
            {
                imgType: 'icon', // type of image icon/image
                imgClasses: 'icon-db icon-db-store colored', // classes for icon type
                title: 'Store', // title of item
                note: 'Click me', // description, optional
                outside: true, // icon at right side, optional
                onSelect: ( event, item ) => { // function on click on item, optional
                    console.log('event', event );
                    console.log('item', item );
                    alert('clicked');
                }
            },
            {
                ...
            }
            ...
        ]
    },
    {
        title: 'Customers',
        items: [
            {
                imgType: 'image',
                imgSrc: 'https://pbs.twimg.com/profile_images/2703930724/6af22d15ddceccbc7e05302921f743b9.png', // path to image if type is image
                title: 'John Doe',
                note: 'john.doe@google.com'
            }
            ...
        ]
    }
    ...
];
```


### Add search results to your template

```angular2html
<pe-search-results [searchResults]="searchResults" isIconsHidden="true"></pe-search-results>
```
