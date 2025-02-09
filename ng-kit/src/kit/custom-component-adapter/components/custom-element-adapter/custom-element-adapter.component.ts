import { Component, Input, AfterViewInit, ElementRef, HostBinding } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgElement } from '@angular/elements';

@Component({
  selector: 'pe-custom-element-adapter',
  templateUrl: './custom-element-adapter.component.html',
  styleUrls: ['./custom-element-adapter.component.scss']
})
export class CustomElementAdapter implements AfterViewInit {
  @Input('tag') set setComponent(tag: string) {
    this.markup = this.sanitizer.bypassSecurityTrustHtml(`<${tag}></${tag}>`);
  }
  @HostBinding('innerHtml')
  markup: any = '';

  @Input()
  options: {[key: string]: any } = {};
  @Input()
  events: {[key: string]: () => {} } = {};

  constructor(private sanitizer: DomSanitizer, private element: ElementRef) {
  }

  ngAfterViewInit() {
    const customElement: NgElement = this.element.nativeElement.children[0];

    if (!customElement) {
      return;
    }

    Object.entries(this.options || {}).forEach(([key, value]) => {
      customElement[key] = value;
    });

    Object.entries(this.events || {}).forEach(([key, value]) => {
      customElement.addEventListener(key, value);
    });
  }
}
