import { Component, ChangeDetectionStrategy } from '@angular/core';

import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-rate-error',
  templateUrl: './rate-error.component.html',
  styleUrls: ['./rate-error.component.scss'],
})
export class UIRateErrorComponent extends UIBaseComponent {}
