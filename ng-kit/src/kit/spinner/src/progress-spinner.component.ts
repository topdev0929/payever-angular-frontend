import { Component, Input } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { SpinnerConfig } from '../config';

@Component({
  selector: 'pe-progress-spinner',
  templateUrl: './progress-spinner.component.html',
  styleUrls: ['./progress-spinner.component.scss']
})
export class ProgressSpinnerComponent {

  @Input() mode: ProgressSpinnerMode = 'determinate';
  @Input() diameter: number = SpinnerConfig.diameter;
  @Input() strokeWidth: number = SpinnerConfig.strokeWidth;
  @Input() value: number = 0;
  @Input() checkWhenDone: boolean = true;

}
