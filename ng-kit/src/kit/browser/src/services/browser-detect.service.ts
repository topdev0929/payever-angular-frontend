import { Injectable } from '@angular/core';

const InstallTrigger: any = null;

@Injectable()
export class BrowserDetectService {

  // Opera 8.0+
  get isOpera(): boolean {
    return (!!this.getWindow().opr && !!this.getWindow().opr.addons) || !!this.getWindow().opera || navigator.userAgent.indexOf(' OPR/') >= 0;
  }

  // Firefox 1.0+
  get isFirefox(): boolean {
    return typeof InstallTrigger !== 'undefined';
  }

  // Safari 3.0+ "[object HTMLElementConstructor]"
  get isSafari(): boolean {
    return /constructor/i.test(this.getWindow().HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!this.getWindow['safari'] || (typeof this.getWindow().safari !== 'undefined' && this.getWindow().safari.pushNotification));
  }

  // Internet Explorer 6-11
  get isIE(): boolean {
    return /*@cc_on!@*/false || !!this.getDocument().documentMode;
  }

  // Edge 20+
  get isEdge(): boolean {
    return !this.isIE && !!this.getWindow().StyleMedia;
  }

  // Chrome 1+
  get isChrome(): boolean {
    return !!this.getWindow().chrome && !!this.getWindow().chrome.webstore;
  }

  private getWindow(): any {
    return window;
  }

  private getDocument(): any {
    return document;
  }

}
