import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'pe-claim-pick-file',
  templateUrl: './pick-file.component.html',
  styleUrls: ['./pick-file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimPickFileComponent {
  @Output() filePicked = new EventEmitter<File[]>();

  isDragging = false;
  translationsScope = 'transactions.form.claim';

  onFileOver(isDragging: boolean): void {
    this.isDragging = isDragging;
  }

  onFileDrop(files: FileList): void {
    this.isDragging = false;

    files.length && this.filePicked.emit(Array.from(files));
  }

  onPickFile(event: Event): void {
    const targetElement = event.target as HTMLInputElement;
    const files: File[] = Array.from<File>(targetElement.files);
    this.filePicked.emit(files);
  }
}
