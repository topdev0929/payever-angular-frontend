import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AppThemeEnum } from '@pe/common';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'sandbox';
  theme = AppThemeEnum.default;
  constructor( ) { }
}
