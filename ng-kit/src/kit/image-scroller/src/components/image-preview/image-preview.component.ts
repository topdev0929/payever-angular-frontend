import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { peVariables } from '../../../../pe-variables';

@Component({
  selector: 'pe-image-preview',
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.scss']
})
export class ImagePreviewComponent {

  spinnerMode: ProgressSpinnerMode = 'determinate';
  spinnerDiameter: number = peVariables.toNumber('spinnerStrokeXs');

  @Input() imageSrc: string;
  @Input() selected: boolean = false;
  @Input() width: number;
  @Input() uploadInProgress: boolean = false;
  @Input() uploadProgress: number = 0;
  @Input() deleteAvailable: boolean = false;

  @Output() imageSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteButtonClick: EventEmitter<any> = new EventEmitter<any>();

  get uploadProgressInt(): number {
    return Math.round(this.uploadProgress);
  }

}
