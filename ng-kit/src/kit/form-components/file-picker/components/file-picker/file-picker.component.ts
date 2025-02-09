import {
  Component,
  Input,
  Injector,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { AbstractFieldComponent } from '../../../../form-core/components/abstract-field';

@Component({
  selector: 'pe-file-picker',
  templateUrl: 'file-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilePickerComponent extends AbstractFieldComponent {

  @Input() description: string;
  @Input() label: string;
  @Input() accept: string = '';
  @Input() multiple: boolean;

  @Input() placeholder: string;

  @Output() valueChange: EventEmitter<File[]> = new EventEmitter<File[]>();

  @ViewChild('fileSelector') fileSelector: ElementRef;

  imageUrls: WeakMap<File, SafeUrl> = new WeakMap();
  isDragging: boolean = false;

  constructor(
    protected injector: Injector,
    private sanitizer: DomSanitizer) {
    super(injector);
  }

  onFileOver(isDragging: boolean): void {
    this.isDragging = isDragging;
  }

  onFileDrop(fileList: FileList): void {
    this.isDragging = false;
    let files = Array.from(fileList);

    if (this.accept) {
      const fileExtensions = this.accept.split(',');
      files = files.filter((file: File) => {
        return fileExtensions.some((ext: string) => {
          return !!file.name.match(`${ext.trim()}$`);
        });
      });
    }

    this.addFiles(files);
  }

  pickFiles(event: Event): void {
    const fileInput: HTMLInputElement = event.target as HTMLInputElement;
    const files: File[] = Array.from(fileInput.files);
    this.addFiles(files);
  }

  clearFiles(): void {
    this.formControl.setValue([]);
    this.valueChange.emit([]);
    this.imageUrls = new WeakMap();
  }

  deleteFile(index: number): void {
    this.imageUrls.delete(this.formControl.value[index]);
    this.formControl.value.splice(index, 1);
  }

  private addFiles(files: File[]) {
    const newValue: File[] = this.multiple
      ? files.concat(this.formControl.value || [])
      : [files[0]];

    if (this.multiple) {
      files.forEach((file: File) => {
        if (this.isImage(file)) {
          this.imageUrls.set(file, this.getImageUrl(file));
        }
      });
    }

    this.fileSelector.nativeElement.value = null;
    this.formControl.setValue(newValue);
    this.valueChange.emit(newValue);
  }

  private isImage(file: File): boolean {
    return file.type.startsWith(`image/`);
  }

  private getImageUrl(file: File): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
  }
}
