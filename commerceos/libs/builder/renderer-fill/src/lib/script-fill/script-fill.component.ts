import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

import { PebRenderContainer, PebJsFill } from '@pe/builder/core';

@Component({
  selector: 'peb-script-fill',
  templateUrl: './script-fill.component.html',
  styleUrls: ['./script-fill.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebScriptFillComponent implements OnChanges {
  @Input() fill!: PebJsFill;
  @Input() container?: PebRenderContainer;

  private scriptUrl!: string;
  private iframe?: HTMLIFrameElement;
  private hasLoaded = false;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngOnChanges({ fill }: SimpleChanges): void {
    if (fill?.currentValue && fill.currentValue.url !== fill.previousValue?.url) {
      this.hasLoaded = false;
      this.scriptUrl = fill.currentValue.url;
      this.loadScripts();
    }
  }

  setIframe(iframe: HTMLIFrameElement): void {
    this.iframe = iframe;
    this.hasLoaded = false;
    this.loadScripts();
  }

  loadScripts(): void {
    if (this.container?.editMode || this.hasLoaded || !this.iframe || !this.scriptUrl) {
      return;
    }

    const iframe = this.iframe;
    const script = document.createElement('script');
    script.src = this.scriptUrl;

    if (iframe.contentDocument) {
      iframe.contentDocument.head.appendChild(script);
      iframe.contentDocument.body.style.overflow = 'hidden';
      iframe.contentDocument.body.style.margin = '0';
      iframe.contentDocument.body.style.padding = '0';
    }
    this.hasLoaded = true;
  }
}
