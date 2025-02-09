import { Component, ChangeDetectionStrategy } from '@angular/core';

import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-footer-powered-by-payever',
  templateUrl: './footer-powered-by-payever.component.html',
  styleUrls: ['./footer-powered-by-payever.component.scss'],
})
export class UIFooterPoweredByPayeverComponent extends UIBaseComponent {}
