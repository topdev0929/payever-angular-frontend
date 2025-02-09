import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
@Component({
  selector: 'pe-lib-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
})
export class UploaderComponent implements OnInit, OnChanges {
  @Input() files: File[];
  progreValue: number;
  @Input() set progress(value: number) {
    this.progressBar = value;
  }
  get progress(): number {
    return this.progressBar;
  }
  value: string;
  progressBar: number;
  startProgress: any;
  @Input() get theme(): string {
    return this.value;
  }
  set theme( value: string) {
    this.value = value;
  }
  @Output() cancelUploadEmitter = new EventEmitter();
  itemsUpload: number;
  constructor() { }

  ngOnInit(): void {

  }


  cancelUpload(): void {
    this.cancelUploadEmitter.emit(true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.progreValue = (1 - (this.progressBar /  this.startProgress)) * 100;
    if (this.files) {
      this.itemsUpload = this.files.length;
    }
    if (changes.progress.currentValue && this.progress > 0) {
      this.startProgress = this.progress;
    }
  }
}
