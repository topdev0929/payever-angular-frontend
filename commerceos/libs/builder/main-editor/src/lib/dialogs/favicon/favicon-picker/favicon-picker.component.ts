import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';


const getUniqueId = () => "favicon-input";

@Component({
  selector: 'peb-favicon-picker',
  templateUrl: './favicon-picker.component.html',
  styleUrls: ['./favicon-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoAndStatusPickerComponent {
  inputId = `logo-picker-${getUniqueId()}`;
  files;
  @Input() image;
  @Input() addButtonLabel = 'Add Media';
  @Input() removeButtonLabel = 'Remove';
  @Input() abbrevation: string;
  @Input() isImageLoading = false;
  @Output() file: EventEmitter<File[]> = new EventEmitter<File[]>();

  @Output() selectChanged = new EventEmitter<any>();


  fileChangeEvent(event: Event) {
    const target = event.target as HTMLInputElement;
    this.files = target.files;
    this.file.emit(this.files);
  }
}
