import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { getUniqueId } from '../../misc/helpers/unique-id-counter.helper';

interface LogoPickerSelectItemInterface {
  value: any;
  label: string;
}

@Component({
  selector: 'peb-logo-and-status-picker',
  templateUrl: './logo-and-status-picker.component.html',
  styleUrls: ['./logo-and-status-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoAndStatusPickerComponent {
  inputId = `logo-picker-${(getUniqueId())}`;
  files;
  @Input() image;
  @Input() addButtonLabel: string = 'Add Logo';
  @Input() abbrevation: string;
  @Input() isImageLoading = false;
  @Output() file: EventEmitter<File[]> = new EventEmitter<File[]>();

  @Input() selectList: LogoPickerSelectItemInterface[] = [];
  @Input() selectedItem: LogoPickerSelectItemInterface;
  @Input() selectLabel: string;
  @Output() selectChanged = new EventEmitter<any>();
  @ViewChild('select', {static: false}) selectElement: any;

  fileChangeEvent(event: Event) {
    const target = event.target as HTMLInputElement;
    this.files = target.files;
    this.file.emit(this.files);
  }

  setSelectedItem(selected: any) {
    this.selectChanged.emit(selected);
  }

  triggerSelect() {
    this.selectElement.showDropdown();
  }
}
