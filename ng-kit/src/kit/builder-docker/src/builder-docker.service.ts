import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class BuilderDockerService {
  itemDrag = new EventEmitter<any>();
  itemDragStart = new EventEmitter<any>();
  itemDragEnd = new EventEmitter<any>();
}
