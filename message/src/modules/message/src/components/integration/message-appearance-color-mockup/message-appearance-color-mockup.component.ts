import {Component, ChangeDetectionStrategy, Input, HostListener, Output, EventEmitter} from '@angular/core';
import { PeMessageIntegrationSettings } from '../../../enums';

@Component({
  selector: 'pe-message-appearance-color-mockup',
  templateUrl: './message-appearance-color-mockup.component.html',
  styleUrls: ['./message-appearance-color-mockup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeMessageAppearanceColorMockupComponent {

  @Input() selected: boolean = false;
  @Input() title: string = '';
  @Input() bgChatColor = PeMessageIntegrationSettings.bgChatColor;
  @Input() messagesTopColor = PeMessageIntegrationSettings.messagesTopColor;
  @Input() messagesBottomColor = PeMessageIntegrationSettings.messagesBottomColor;

  @Output() onSelect: EventEmitter<boolean> = new EventEmitter();

  @HostListener('click', ['$event'])
  onClick(event: any) {
    event.preventDefault();
    this.selected = true;
    this.onSelect.emit(true);
  }

}
