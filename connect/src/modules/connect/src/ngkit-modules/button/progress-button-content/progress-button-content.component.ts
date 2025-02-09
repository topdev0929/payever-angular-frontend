import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pe-progress-button-content',
  templateUrl: './progress-button-content.component.html',
  styleUrls: ['./progress-button-content.component.scss']
})
export class ProgressButtonContentComponent {

  @Input() loading: boolean = false;
  // @TODO when we will have more cases we can define these spinner parameters
  // according to mat-button variations
  @Input() spinnerStrokeWidth: number = 2;
  @Input() spinnerDiameter: number = 26;
  @Input() spinnerColor: string;

}
