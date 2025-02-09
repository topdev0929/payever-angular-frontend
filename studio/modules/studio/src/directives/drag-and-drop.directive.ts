import { ChangeDetectorRef, Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Directive({
  selector: '[peAppDrag]',
})
export class DragDirective {
  initialColor = this.sanitizer.bypassSecurityTrustStyle('linear-gradient(to bottom, #ededf4, #aeb0b7 99%), linear-gradient(to bottom, #474747, #000000)');
  hoverColor = this.sanitizer.bypassSecurityTrustStyle('#999');

  @Output() files: EventEmitter<FileList> = new EventEmitter();

  @HostBinding('style.background')
    private background = this.initialColor;

  constructor(
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) { }

  @HostListener('dragover', ['$event']) public onDragOver(evt: DragEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = this.hoverColor;
    this.cdr.detectChanges();
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt: DragEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = this.initialColor;
    this.cdr.detectChanges();
  }

  @HostListener('drop', ['$event']) public onDrop(evt: DragEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = this.initialColor;
    this.cdr.detectChanges();
    if (evt.dataTransfer.files.length > 0) {
      this.files.emit(evt.dataTransfer.files);
    }
  }
}
