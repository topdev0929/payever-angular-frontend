import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { IDockerItem } from './docker-item';

@Component({
  selector: 'pe-builder-docker',
  styleUrls: ['builder-docker.component.scss'],
  templateUrl: 'builder-docker.component.html'
})
export class BuilderDockerComponent implements OnInit {

  @Input() itemsList: IDockerItem[];
  @Input() width: string;
  @Output() select: EventEmitter<IDockerItem> = new EventEmitter<IDockerItem>();
  isSubItemsShown: boolean = false;
  private currentItemsList: IDockerItem[];
  private activeItem: IDockerItem;

  ngOnInit(): void {
    this.currentItemsList = this.itemsList;
  }

  onSelect(item: IDockerItem): void {
    this.activeItem = item;

    if (this.activeItem.subItems) {
      this.currentItemsList = this.activeItem.subItems;
      this.isSubItemsShown = true;
    }

    if (typeof this.activeItem.onSelect === 'function') {
      this.activeItem.onSelect();
    }

    this.select.emit(item);
  }

  getItemsList(): IDockerItem[] {
    return this.currentItemsList;
  }

  returnToTopLevel(): void {
    this.currentItemsList = this.itemsList;
    this.isSubItemsShown = false;
    this.activeItem = null;
  }
}
