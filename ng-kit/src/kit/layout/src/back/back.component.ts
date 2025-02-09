import { Component, Input, Output, EventEmitter } from '@angular/core';

export type RouterLinkType = any[] | string;

@Component({
  selector: 'pe-layout-back',
  templateUrl: './back.component.html'
})
export class LayoutBackComponent {
  @Input() href: string;
  @Input() link: RouterLinkType;
  @Input() text: string;

  @Output() click: EventEmitter<MouseEvent> = new EventEmitter();

  get isLink(): boolean {
    return Boolean(this.link);
  }

  get isHref(): boolean {
    return !Boolean(this.link) && Boolean(this.href);
  }
}
