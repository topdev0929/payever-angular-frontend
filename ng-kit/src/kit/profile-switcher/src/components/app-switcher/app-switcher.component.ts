import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PeProfileCardInterface, PeProfileCardConfigInterface } from '../../interfaces';

@Component({
  selector: 'pe-app-switcher',
  templateUrl: './app-switcher.component.html',
  styleUrls: ['./app-switcher.component.scss']
})
export class PeAppSwitcherComponent {

  @Input() activeItem: string;
  @Input() profileCardConfig: PeProfileCardConfigInterface = null;
  @Input() list: PeProfileCardInterface[];
  @Input() listTitle: string;
  @Input() showTopSwitcher: boolean;
  @Input() showTopSwitcherLoader: boolean;
  @Input() listItemWithLoader: string;

  @Output() onProfileCardClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() onProfileFromListClick: EventEmitter<PeProfileCardInterface> = new EventEmitter<PeProfileCardInterface>();

  opened: boolean = false;

  toggleOpen(): void {
    this.opened = !this.opened;
  }
}
