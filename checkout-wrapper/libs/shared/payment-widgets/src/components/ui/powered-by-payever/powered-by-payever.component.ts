import { Component, ChangeDetectionStrategy } from '@angular/core';

import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-powered-by-payever',
  templateUrl: './powered-by-payever.component.html',
  styleUrls: ['./powered-by-payever.component.scss'],
})
export class UIPoweredByPayeverComponent extends UIBaseComponent {}
