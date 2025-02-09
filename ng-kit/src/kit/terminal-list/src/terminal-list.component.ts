import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TerminalListItem, TerminalListAction, TerminalListSelect, TerminalListToggle } from './terminal-list.interface';

@Component({
  selector: 'pe-terminal-list',
  templateUrl: 'terminal-list.component.html',
  styleUrls: ['terminal-list.component.scss']
})

export class TerminalListComponent {
  @Input() listItems: TerminalListItem[];
  @Output('onActionSelect') selectEvent = new EventEmitter<TerminalListSelect>();
  @Output('onItemSwitchToggle') switchToggleEvent = new EventEmitter<TerminalListToggle>();

  onActionSelect(action: TerminalListAction, item: TerminalListItem) {
    if (typeof action.onSelect === 'function') {
      action.onSelect(action, item);
      this.selectEvent.emit({action: action, item: item});
    }
  }

  onSwitchToggle(e: Event, item: TerminalListItem) {
    this.switchToggleEvent.emit( {switch: (<HTMLInputElement>e.target).checked, item: item} );
  }
}
