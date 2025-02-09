import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ThemeCardActions } from './theme-card.interface';

@Component({
  selector: 'pe-theme-card',
  templateUrl: 'theme-card.component.html',
  styleUrls: ['theme-card.component.scss']
})

export class ThemeCardComponent {
  @Input() uuid: string;
  @Input() title: string;
  @Input() subTitle: string;
  @Input() image: string;
  @Input() actions: ThemeCardActions[];
  @Input() dropdownMenuRight: boolean = false;
  @Output('onClick') onClick: EventEmitter<string> = new EventEmitter();

  onActionSelect(action: ThemeCardActions) {
    if ( typeof action.onSelect == 'function') {
      action.onSelect(this.uuid);
    }
  }

  onCardClick(event: Event) {
    this.onClick.emit(this.uuid);
  }
}
