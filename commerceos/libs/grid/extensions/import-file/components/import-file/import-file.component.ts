import {
  Component,
  ElementRef,
  EventEmitter,
  Input, OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { PeGridMenuComponent } from '@pe/grid';

import { ImportEventPayload, ImportMenuOptions } from '../import-menu/import-menu.component';
import { OutputImportedFileInterface } from '../../types/import.interfaces';

enum FileType {
  CSV,
  XML,
}

@Component({
  selector: 'pe-gex-import-file',
  templateUrl: './import-file.component.html',
})
export class ImportFileComponent implements OnInit {

  @Input() options: ImportMenuOptions;
  @Input() menuRef: PeGridMenuComponent;

  @Output() chosenFile = new EventEmitter<OutputImportedFileInterface>();

  @ViewChild('csvFileInput') csvFileInput: ElementRef<HTMLInputElement>;
  @ViewChild('xmlFileInput') xmlFileInput: ElementRef<HTMLInputElement>;

  FileType = FileType;

  private overwrite = false;

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
  ) {
  }

  ngOnInit() {
    this.iconRegistry.addSvgIcon(
      'help-icon',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/help-icon.svg'),
    );
  }

  selectImportFile(type: FileType, payload: ImportEventPayload): void {
    this.overwrite = payload.overwrite;
    if (type === FileType.CSV && this.csvFileInput) {
      this.csvFileInput.nativeElement.click();
    } else if (type === FileType.XML && this.xmlFileInput) {
      this.xmlFileInput.nativeElement.click();
    }
  }

  export(e: any): void {
    const fileList: FileList = e.target.files;
    const file: File = fileList.item(0);
    if (file) {
      this.chosenFile.emit({
        file,
        overwrite: this.overwrite,
      });
    }
    this.menuRef.closeMenu.emit();
  }

}
