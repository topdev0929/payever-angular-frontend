import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

export interface Options {
  readAs?: string;
}

@Directive({
  selector: '[peFileDrop]'
})
export class FileDropDirective {

  @Input() public options: Options;

  @Output() public onFileOver: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() public onFileDrop: EventEmitter<FileList> = new EventEmitter<FileList>();

  private element: ElementRef;

  constructor(
    element: ElementRef
  ) {
    this.element = element;
  }

  @HostListener('dragover', ['$event'])
  public onDragOver(event: any/*DragEvent*/): void { // DragEvent is missing on Safari; @TODO investigat later on
    const transfer: any = this.getDataTransfer(event);

    if (this.hasFiles(transfer.types)) {
      transfer.dropEffect = 'copy';
      this.preventAndStop(event);
      this.emitFileOver(true);
    }
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(event: Event): void {
    if (event.currentTarget !== this.element.nativeElement) {
      this.preventAndStop(event);
      this.emitFileOver(false);
    }
  }

  @HostListener('drop', ['$event'])
  public onDrop(event: any/*DragEvent*/): void { // DragEvent is missing on Safari; @TODO investigat later on
    const transfer: DataTransfer = this.getDataTransfer(event);

    if (transfer) {
      this.preventAndStop(event);
      this.emitFileOver(false);
      this.readFile(transfer.files);
    }
  }

  private preventAndStop(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private emitFileOver(isOver: boolean): void {
    this.onFileOver.emit(isOver);
  }

  private emitFileDrop(files: FileList): void {
    this.onFileDrop.emit(files);
  }

  private getDataTransfer(event: DragEvent/*DragEvent*/): DataTransfer { // DragEvent is missing on Safari; @TODO investigat later on
    return event.dataTransfer;
  }

  private hasFiles(types: string[]): boolean {
    return ( types.indexOf('Files') !== -1 );
  }

  private readFile(files: FileList): void {
    this.emitFileDrop(files);
  }
}
