import { ChangeDetectionStrategy, Component, ElementRef, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { PebRenderContainer, PebIframeFill } from '@pe/builder/core';

@Component({
  selector: 'peb-iframe-fill',
  templateUrl: './iframe-fill.component.html',
  styleUrls: ['./iframe-fill.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebIframeFillComponent {
  @Input() set fill(data: PebIframeFill) {
    const isLazy = data.lazy?.enabled === true;
    this.lazySrc = isLazy ? data.src : '';
    this.safeSrc = this.sanitized.bypassSecurityTrustResourceUrl(isLazy ? '' : data.src || '');
  }

  @Input() container?: PebRenderContainer;

  lazySrc = '';
  safeSrc: SafeResourceUrl | undefined = undefined;

  constructor(
    private sanitized: DomSanitizer,
    private readonly elementRef: ElementRef<HTMLElement>,
  ) {
  }
}
