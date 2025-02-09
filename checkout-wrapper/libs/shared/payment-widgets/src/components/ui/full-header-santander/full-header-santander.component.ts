import { Component, ChangeDetectionStrategy } from '@angular/core';

import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-full-header-santander',
  templateUrl: './full-header-santander.component.html',
  styleUrls: ['./full-header-santander.component.scss'],
})
export class UIFullHeaderSantanderComponent extends UIBaseComponent {
}
