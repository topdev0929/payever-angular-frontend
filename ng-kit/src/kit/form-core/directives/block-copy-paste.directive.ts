import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[peBlockCopyPaste]',
})
export class BlockCopyPasteDirective {

  @Input('peBlockCopyPaste') peBlockCopyPaste: boolean = true;

  constructor() {}

  @HostListener('paste', ['$event']) onPaste(event: KeyboardEvent): void {
    if (this.peBlockCopyPaste) {
      event.preventDefault();
    }
  }

  @HostListener('copy', ['$event']) onCopy(event: KeyboardEvent): void {
    if (this.peBlockCopyPaste) {
      event.preventDefault();
    }
  }

  @HostListener('cut', ['$event']) onCut(event: KeyboardEvent): void {
    if (this.peBlockCopyPaste) {
      event.preventDefault();
    }
  }
}
