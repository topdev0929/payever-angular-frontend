import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AppThemeEnum, EnvService } from '@pe/common';
import { PlaceholderCellInterface } from '@pe/grid/shared';

@Component({
  selector: 'pe-hidden-value',
  templateUrl: './hidden-value.component.html',
  styleUrls: ['./hidden-value.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HiddenValueComponent implements PlaceholderCellInterface {
  listSizeIcon = false

  public theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.dark;

  constructor(
    private envService: EnvService,
  ) {
  }

}
