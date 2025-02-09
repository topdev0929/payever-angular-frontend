import {Component, EventEmitter, Input, Output} from '@angular/core';
import { IDockerStoreItem } from './docker-store-item';

@Component({
  selector: 'pe-docker-store-item',
  styleUrls: ['docker-store-item.component.scss'],
  templateUrl: 'docker-store-item.component.html',
  host: { class : 'mItem' }
})
export class DockerStoreItemComponent {
  @Input() dockerItem: IDockerStoreItem;

  @Output() select: EventEmitter<void> = new EventEmitter<void>();

  public onClick(): void {
    this.select.emit();
  }
}
