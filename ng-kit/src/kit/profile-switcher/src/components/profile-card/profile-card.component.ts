import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PeProfileCardConfigInterface, ProfileCardType } from '../../interfaces';

@Component({
  selector: 'pe-profile-switcher-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class PeProfileCardComponent {

  @Input() config: PeProfileCardConfigInterface;
  @Input() showLoader: boolean;

  @Output() footerButtonClicked: EventEmitter<void> = new EventEmitter<void>();
  @Output() cardButtonClicked: EventEmitter<void> = new EventEmitter<void>();

  opened: boolean = false;
  profileCardType: typeof ProfileCardType = ProfileCardType;

  toggleOpen(): void {
    if (this.config.images.length > 1) {
      this.opened = !this.opened;
      this.footerButtonClicked.emit();
    } else {
      this.cardButtonClicked.emit();
    }
  }

}
