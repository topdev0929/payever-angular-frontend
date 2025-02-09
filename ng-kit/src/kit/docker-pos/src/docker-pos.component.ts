import { Component, Input, OnInit } from '@angular/core';
import { IDockerPosItem } from './docker-pos-item';

/**
 * @deprecated Should be replaced to pe-docker
 */
@Component({
  selector: 'pe-docker-pos',
  templateUrl: 'docker-pos.component.html',
})
export class DockerPosComponent implements OnInit {

  @Input() itemsList: IDockerPosItem[];
  private currentItemsList: IDockerPosItem[];
  private activeItem: IDockerPosItem;

  ngOnInit() {
    this.currentItemsList = this.itemsList;
  }

  onSelect(item: IDockerPosItem) {
    this.activeItem = item;
    if(!this.activeItem.isDisabled) {
      this.currentItemsList.filter(function (itemActive: IDockerPosItem) {
        if (itemActive.isCurrent == true) {
          itemActive.isCurrent = false;
        }
      });
      this.activeItem.isCurrent = true;
      if (typeof this.activeItem.onSelect === 'function') {
        this.activeItem.onSelect();
      }
    }
  }

  getItemsList() {
    return this.currentItemsList;
  }

}
