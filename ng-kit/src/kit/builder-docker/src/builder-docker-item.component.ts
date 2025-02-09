import { fromEvent as observableFromEvent, Subscription } from 'rxjs';
import { Component, ElementRef, HostListener, Input, NgZone } from '@angular/core';
import { IDockerItem } from './docker-item';
import { BuilderDockerService } from './builder-docker.service';

@Component({
  selector: 'pe-builder-docker-item',
  templateUrl: 'builder-docker-item.component.html',
  styleUrls: ['builder-docker-item.component.scss']
})
export class BuilderDockerItemComponent {
  @Input() dockerItem: IDockerItem;
  @Input() isActive: boolean;
  private dragSubs: Subscription[] = [];
  private isDragStarted: boolean;
  readonly dragClass: string = 'dragging';
  readonly mirrorElId: string = 'db-mirror-id';
  readonly mirrorElClass: string = 'db-mirror';
  readonly mirrorElDropedClass: string = 'db-mirror-dropped';

  private itemOffsetLeftDiff: number;
  private itemOffsetTopDiff: number;

  constructor(private builderDockerService: BuilderDockerService,
              private elementRef: ElementRef,
              private zone: NgZone) {
  }

  createClonedItem(event: any) {
    let elemMirror = document.createElement('div');
    elemMirror.className = this.mirrorElClass;
    elemMirror.id = this.mirrorElId;

    let currentElement = this.elementRef.nativeElement.firstChild;
    let clonedElement = currentElement.cloneNode(true);

    elemMirror.appendChild(clonedElement);

    elemMirror.style.width = currentElement.offsetWidth + 'px';
    elemMirror.style.height = currentElement.offsetHeight + 'px';

    this.itemOffsetLeftDiff = event.clientX - currentElement.getBoundingClientRect().left;
    this.itemOffsetTopDiff = event.clientY - currentElement.getBoundingClientRect().top;

    document.body.appendChild(elemMirror);
  }

  destroyClonedItem() {
    var element = document.getElementById(this.mirrorElId);
    element.classList.add(this.mirrorElDropedClass);

    setTimeout(function () {
      element.parentNode.removeChild(element);
    }, 150);
  }

  setElemMirrorCoords(x: number, y: number) {
    let elemMirror = document.getElementById(this.mirrorElId);

    x -= this.itemOffsetLeftDiff;
    y -= this.itemOffsetTopDiff;

    elemMirror.style.top = y + 'px';
    elemMirror.style.left = x + 'px';
  }

  hasSubItems(): boolean {
    return typeof this.dockerItem.subItems !== typeof undefined;
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (!this.hasSubItems()) {

      this.dragSubs.push(
        observableFromEvent(window, 'mouseup')
          .subscribe((e: MouseEvent) => this.onDragEnd(e)),
        observableFromEvent(window, 'mousemove')
          .subscribe((e: MouseEvent) => this.onDrag(e)),
        observableFromEvent(window, 'selectstart')
          .subscribe((e: MouseEvent) => this.onWrongEvent(e))
      );
    }
  }

  @HostListener('dragstart', ['$event'])
  onWrongEvent(event: MouseEvent) {
    event.preventDefault();
  }

  onDragStart(event: MouseEvent) {
    this.createClonedItem(event);
    this.elementRef.nativeElement.firstChild.classList.add(this.dragClass);
    this.builderDockerService.itemDragStart.emit([event, this.dockerItem]);
    this.isDragStarted = true;
  }

  onDrag(event: MouseEvent) {
    if (!this.isDragStarted) {
      this.onDragStart(event);
    }

    this.zone.runOutsideAngular(() => {
      let elemMirror = document.getElementById(this.mirrorElId);
      this.builderDockerService.itemDrag.emit([event, this.dockerItem, elemMirror]);
      this.setElemMirrorCoords(event.clientX, event.clientY);
    });
  }

  onDragEnd(event: MouseEvent) {

    if (this.isDragStarted) {
      this.builderDockerService.itemDragEnd.emit([event, this.dockerItem]);
      this.elementRef.nativeElement.firstChild.classList.remove(this.dragClass);
      this.destroyClonedItem();
      this.isDragStarted = false;
    }

    for (let sub of this.dragSubs) {
      sub.unsubscribe();
    }
    this.dragSubs = [];
  }
}
