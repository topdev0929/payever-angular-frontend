import { Component } from '@angular/core';
import { TerminalListItem, TerminalListSelect, TerminalListToggle } from '../../../../../modules/terminal-list';

@Component({
  selector: 'doc-terminal-list',
  templateUrl: 'terminal-list-doc.component.html'
})
export class TerminalListDocComponent {
  listItems: TerminalListItem[] = [
    {
      title: 'Title name',
      desc: 'Some description',
      iconPng: require('../../../assets/img/Bender-300x300.jpg'),
      action: { label: 'Action', onSelect: function(action, item) {} },
      actionGroup: [
        { label: 'Action one', onSelect: function(action, item) {} },
        { label: 'Action second', onSelect: function(action, item) {} },
        { label: 'Action third' },
      ],
      hasSwitch: true,
      switchOn: true,
    },
    {
      title: 'Title name 2',
      desc: 'Some description 2',
      hasSwitch: true,
      content: 'Any content'
    },
  ];

  onActionSelectHandler(actionSelect: TerminalListSelect) {
    
  }
  onItemSwitchToggleHandler(itemToggle: TerminalListToggle) {
    
  }

  html1 = `
<pe-terminal-list
  [listItems]="listItems"
  (onActionSelect)="onActionSelectHandler($event)"
  (onItemSwitchToggle)="onItemSwitchToggleHandler($event)"
  >
</pe-terminal-list>
  `;

  js1 =  `
import { TerminalListItem, TerminalListSelect, TerminalListToggle } from '@pe/ng-kit/modules/terminal-list';

listItems: TerminalListItem[] = [
  {
    title: 'Title name',
    desc: 'Some description',
    iconPng: require('../../../assets/img/Bender-300x300.jpg'),
    action: { label: 'Action', onSelect: function(action, item){ 
    actionGroup: [
      { label: 'Action one', onSelect: function(action, item){ 
      ...
    ],
    hasSwitch: true,
    switchOn: true,
  },
  ...
];

onActionSelectHandler(actionSelect: TerminalListSelect) {
  
}
onItemSwitchToggleHandler(itemToggle: TerminalListToggle) {
  
}
  `;
}
