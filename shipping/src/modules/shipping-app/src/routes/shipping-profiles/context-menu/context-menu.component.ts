import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractComponent } from '../../../misc/abstract.component';
import { AppThemeEnum, EnvService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';

@Component({
  selector: 'peb-shipping-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
})
export class PebShippingContextMenuComponent extends AbstractComponent implements OnInit {
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  @Input() actions: any;
  @Output() close: EventEmitter<void> = new EventEmitter();

  constructor(private envService: EnvService, protected translateService: TranslateService) {
    super(translateService);
  }
  ngOnInit() {
  }

  closeContextMenu() {
    this.close.emit();
  }

  onChange(event, action) {
    action.callback(event);
  }
}
