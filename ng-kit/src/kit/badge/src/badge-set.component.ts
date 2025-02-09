import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BadgeItem } from './badge.interface';

@Component({
  selector: 'pe-badge-set',
  styleUrls: ['badge-set.component.scss'],
  templateUrl: 'badge-set.component.html',
})
export class BadgeSetComponent {
  @Input() badgeSet: BadgeItem[];
  @Output('removeItemEvent') removedBadge: EventEmitter<BadgeItem> = new EventEmitter();

  removeBadge( badge: BadgeItem, index: number ): void {
    this.badgeSet.splice(index, 1);
    this.removedBadge.emit(badge);
  }
}
