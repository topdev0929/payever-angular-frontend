import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PeProfileCardInterface, PeProfileCardConfigInterface } from '../../interfaces';

@Component({
  selector: 'pe-profile-switcher',
  templateUrl: './profile-switcher.component.html',
  styleUrls: ['./profile-switcher.component.scss']
})
export class PeSwitcherProfileListComponent {

  @Input() profileCardConfig: PeProfileCardConfigInterface = null;
  @Input() list: PeProfileCardInterface[];
  @Input() personalProfileCardConfig: PeProfileCardConfigInterface = null;
  @Input() listTitle: string;
  @Input() showTopSwitcher: boolean;
  @Input() showBusinessCardLoader: boolean;
  @Input() showPersonalCardLoader: boolean;
  @Input() listItemWithLoader: string;
  @Input() multiLineItemsTitle: boolean = false;

  @Output() onProfileCardClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() onProfileFromListClick: EventEmitter<PeProfileCardInterface> = new EventEmitter<PeProfileCardInterface>();
  @Output() openPersonalProfile: EventEmitter<void> = new EventEmitter<void>();

  opened: boolean = false;

  toggleOpen(): void {
    this.opened = !this.opened;
  }
}
