# Filter

## Usage

### Import module
```ts

  import { FilterModule } from '@pe/ng-kit/modules/filter';
  ...
  
```

### Set titles and button styles for filter
```ts
    filterName: string = 'Add filter';
    filterTitle: string = 'Choose a filter';
    filterBtnClasses: string = 'btn btn-default btn-inline btn-link';
```

### Prepare filter items list
```ts

  let itemsList: IFilterItem[] = [
    {
        title: 'Select a category',
        onSelect: ( event, item ) => {
            ...
        }
    },
    ...
  ]
```

### Set template

````html
  <pe-filter
      [itemsList]="itemsList"
      [filterName]="filterName"
      [filterTitle]="filterTitle"
      [filterBtnClasses]="filterBtnClasses"
      (selectItemEvent)="handleSelectedFilterItem($event)"
  ></pe-filter>
````

### Handle selectItemEvent event emitted

````ts
  handleSelectedFilterItem($event: {event: MouseEvent, item: FilterItem}) {
    console.log('handleSelectedFilterItem', $event);
  }
````
