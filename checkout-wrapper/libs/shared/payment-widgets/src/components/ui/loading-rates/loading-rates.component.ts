import { Component, ChangeDetectionStrategy } from '@angular/core';

import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-loading-rates',
  templateUrl: './loading-rates.component.html',
  styleUrls: ['./loading-rates.component.scss'],
})
export class UILoadingRatesComponent extends UIBaseComponent {}
