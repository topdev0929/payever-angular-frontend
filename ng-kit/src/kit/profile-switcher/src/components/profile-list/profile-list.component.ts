import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PeProfileCardInterface, ProfileMenuItemControlInterface, ProfileButtonControlInterface } from '../../interfaces';

@Component({
  selector: 'pe-profile-switcher-list',
  templateUrl: './profile-list.component.html',
  styleUrls: ['./profile-list.component.scss']
})
export class PeSwitcherBusinessListComponent {

  @Input() activeItem: string;
  @Input() opened: boolean;
  @Input() list: PeProfileCardInterface[] = null;
  @Input() title: string;
  @Input() listItemWithLoader: string;
  @Input() multiLineItemsTitle: boolean = false;

  @Output() onProfileClick: EventEmitter<PeProfileCardInterface> = new EventEmitter<PeProfileCardInterface>();

  private readonly multiLineMaxLength = 26;

  hasControls(item: PeProfileCardInterface): boolean {
    return !!item.leftControl || !!item.rightControl;
  }

  stopEvents(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  handleClick(item: ProfileButtonControlInterface | ProfileMenuItemControlInterface, event: Event): void {
    this.stopEvents(event);
    if (item.onClick) {
      item.onClick();
    }
  }

  formatName(name: string) {
    return name.length >= this.multiLineMaxLength ? `${name.substr(0, this.multiLineMaxLength - 6)} ...` : name;
  }
}
