# Import module
```typescript
import { TerminalListModule } from '@pe/ng-kit/modules/terminal-list';
```
## UiTerminalListComponent
Selector:
- pe-terminal-list

Params:
- listItems: UiTerminalListItem[]

Event Emits:
- onActionSelect
- onItemSwitchToggle

### Usage
````ts
import { UiTerminalListItem, UiTerminalListSelect, UiTerminalListToggle } from '@pe/ng-kit/modules/terminal-list';

listItems: UiTerminalListItem[] = [
  {
    title: 'Title name',
    desc: 'Some description',
    iconPng: require('../../../assets/img/Bender-300x300.jpg'),
    action: { label: 'Action', onSelect: function(action, item){ console.log('logging from main action', action, item); } },
    actionGroup: [
      { label: 'Action one', onSelect: function(action, item){ console.log(action, item); } },
      ...
    ],
    hasSwitch: true,
    switchOn: true,
  },
  ...
];

onActionSelectHandler(actionSelect: UiTerminalListSelect) {
  console.log('onActionSelectHandler', actionSelect);
}
onItemSwitchToggleHandler(itemToggle: UiTerminalListToggle) {
  console.log('onItemSwitchToggleHandler', itemToggle);
}
````

````html
<pe-terminal-list
  [listItems]="listItems"
  (onActionSelect)="onActionSelectHandler($event)"
  (onItemSwitchToggle)="onItemSwitchToggleHandler($event)"
  >
</pe-terminal-list>
````
