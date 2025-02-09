import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { ShortcutsItem, ShortcutsItemLinks } from './shortcuts.interface';

@Component({
  selector: 'pe-shortcuts',
  templateUrl: 'shortcuts.component.html',
  styleUrls: ['./shortcuts.component.scss']
})

export class ShortcutsComponent implements OnInit{
  @Input() itemsList: ShortcutsItem[];
  @Input() itemsPerView: number = 5;
  @Output('onLinkClick') clickedItem = new EventEmitter();
  isDetailsView: boolean;

  private itemsInViewport: ShortcutsItem[];
  private currentFirstItem: number;
  private currentLastItem: number;
  private hasPrev: boolean;
  private hasNext: boolean;
  private currentItem: ShortcutsItem;

  constructor() {}

  ngOnInit() {
    this.currentFirstItem = 0;
    this.currentLastItem = this.itemsPerView;
    this.itemsInViewport = this.itemsList.slice(this.currentFirstItem, this.currentLastItem);
    if (this.itemsList.length > this.itemsPerView ) {
      this.hasNext = true;
    }
    this.currentItem = this.itemsList[0];
  }

  scrollNext() {
    this.hasPrev = true;
    this.currentFirstItem = this.currentLastItem;
    this.currentLastItem += this.itemsPerView;

    if ( this.currentLastItem >= this.itemsList.length ) {
      this.currentLastItem = this.itemsList.length;
      this.currentFirstItem = this.currentLastItem - this.itemsPerView;
      this.hasNext = false;
    }

    this.itemsInViewport = this.itemsList.slice(this.currentFirstItem, this.currentLastItem);
  }

  scrollPrev() {
    this.hasNext = true;
    this.currentLastItem = this.currentFirstItem;
    this.currentFirstItem -= this.itemsPerView;

    if ( this.currentFirstItem <= 0 ) {
      this.currentFirstItem = 0;
      this.currentLastItem = this.itemsPerView;
      this.hasPrev = false;
    }

    this.itemsInViewport = this.itemsList.slice(this.currentFirstItem, this.currentLastItem);
  }

  showDetails(item: ShortcutsItem) {
    this.currentItem = item;
    this.isDetailsView = true;
  }

  backToListView() {
    this.isDetailsView = false;
    this.currentItem = null;
  }

  handleLinkClick(link: ShortcutsItemLinks) {
    this.clickedItem.emit(link);
  }
}
