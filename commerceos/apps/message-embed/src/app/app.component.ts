import {
  Component,
  ElementRef,
  Input,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'pe-message-webcomponent',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [`
    :host.dark {
      color: #fff !important;
    }
    :host.light {
      color: #000 !important;
    }
  `],
})
export class AppComponent {
  @Input() business: string;
  @Input() channels: string;
  private shadowRoot: ShadowRoot;

  constructor(
    elementRef: ElementRef
  ) {
    this.shadowRoot = elementRef.nativeElement.shadowRoot;
    const payeverStatic = (window as any).PayeverStatic;

    payeverStatic?.IconLoader?.loadIcons(
      ['widgets'],
      null,
      this.shadowRoot
    );
  }
}
