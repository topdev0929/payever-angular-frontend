import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[pebHtml]',
})
export class PebHtmlDirective {
  @Input() set pebHtml(html: string | null) {
    this.elmRef.nativeElement.innerHTML = html ?? '';
  }

  constructor(private elmRef: ElementRef) {
  }
}
