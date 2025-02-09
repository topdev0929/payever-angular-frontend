import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finish-status-fail',
  templateUrl: './status-fail.component.html',
  styleUrls: ['./status-fail.component.scss'],
})
export class FinishStatusFailComponent {

  @Input() merchantMode = false;


}
