import { Component, Input } from '@angular/core';
import { IDockerPosItem } from './docker-pos-item';

@Component({
  selector: 'pe-docker-pos-item',
  templateUrl: 'docker-pos-item.component.html',
  host: {'class': 'mItem'},
})
export class DockerPosItemComponent {
  @Input() dockerItem: IDockerPosItem;
  @Input() isActive: boolean;
}
