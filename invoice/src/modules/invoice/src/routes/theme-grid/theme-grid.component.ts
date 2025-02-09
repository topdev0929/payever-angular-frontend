import { Component } from '@angular/core';
import { AppThemeEnum, EnvService, MessageBus } from '@pe/common';


import {AbstractComponent} from '../../misc/abstract.component';

@Component({
  selector: 'peb-theme-grid',
  templateUrl: './theme-grid.component.html',
  styleUrls: ['./theme-grid.component.scss'],
})
export class PebThemeGridComponent extends AbstractComponent {

  theme = this.envService.businessData?.themeSettings?.theme ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default

  constructor(
    private messageBus: MessageBus,
    private envService: EnvService,

  ) {
    super();
  }


  ngOnInit() {
  }

  onThemeInstaled() {
    this.messageBus.emit('invoice.navigate.edit', '');
  }
}
