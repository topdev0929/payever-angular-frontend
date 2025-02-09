import { Component, Input, OnInit } from '@angular/core';
import { IDockerStoreItem } from './docker-store-item';

/**
 * @deprecated Should be replaced to pe-docker
 */
@Component({
  selector: 'pe-docker-store',
  styleUrls: ['docker-store.component.scss'],
  templateUrl: 'docker-store.component.html'
})
export class DockerStoreComponent implements OnInit {

  @Input() itemsList: IDockerStoreItem[];
  private currentItemsList: IDockerStoreItem[];

  ngOnInit(): void {
    this.currentItemsList = this.itemsList;
  }

  onSelect(item: IDockerStoreItem): void {
      if ( typeof item.onSelect === 'function') {
          item.onSelect();
      }
  }

  getItemsList(): any {
    return this.currentItemsList;
  }

}
