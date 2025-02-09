import { Component, Input, SecurityContext } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/destroy';

@Component({
  selector: 'iframe-callback',
  templateUrl: 'iframe-callback.component.html',
  styleUrls: ['iframe-callback.component.scss'],
  providers: [PeDestroyService],
})
export class IframeCallbackComponent {

  @Input('src') set setSrc(src: SafeUrl | string) {
    if (src) {
      if (typeof src === 'string') {
        this.showIframe(src as any);
      } else {
        const raw = this.sanitizer.sanitize(SecurityContext.URL, src);
        this.showIframe(raw);
      }
    }
  }

  constructor(
    protected destroy$: PeDestroyService,
    private sanitizer: DomSanitizer,
  ) {}

  protected showIframe(url: string): void {
    // We have to add delay because when redirect to successUrl is triggered in same time
    // - it creates problems for some shops
    timer(300).pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (!document.querySelector(`iframe[src='${url}']`)) {
        const iframe: HTMLIFrameElement = document.createElement('iframe');
        iframe.className = 'hidden-callback-iframe';
        iframe.src = url;
        iframe.setAttribute('sandbox', 'allow-scripts');
        document.body.appendChild(iframe);
      }
    });
  }
}
