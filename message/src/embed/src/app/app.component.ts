import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'pe-message-webcomponent',
  templateUrl: './app.component.html',
})
export class AppComponent {
  business: string;
  channels: string;

  constructor(element: ElementRef) {
    // this.business = '2382ffce-5620-4f13-885d-3c069f9dd9b4';
    // this.channels = '["bbd07634-5775-4301-a151-f1d2dc8f38be", "bf650d3c-2703-4940-9015-2a5dd20fba3b"]';
    this.business = element.nativeElement.dataset.business;
    this.channels = element.nativeElement.dataset.channels;
  }
}
