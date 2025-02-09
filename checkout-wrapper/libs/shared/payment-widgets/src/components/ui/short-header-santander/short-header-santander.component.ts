import { Component, ChangeDetectionStrategy, Input, HostBinding, TemplateRef } from '@angular/core';

import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-short-header-santander',
  templateUrl: './short-header-santander.component.html',
  styles: [`
  :host {
    font-family: Roboto, sans-serif;
    display: flex;
    align-items: center;
    color: #333333;
    padding: 0 6px 2px;
    font-size: 15px;
    font-weight: 500;
    border-radius: 8px;
    .content-wrapper {
      padding: 0px;
    }
  }
  `],
})
export class UIShortHeaderSantanderComponent extends UIBaseComponent {
  @Input() logo: 'short' | 'medium' = 'medium';
  @Input() logoTemplate: TemplateRef<unknown>;

  @HostBinding('style.color') headerTextColor: string = null;

  onUpdateStyles(): void {
    this.headerTextColor = this.currentStyles?.headerTextColor || this.default.styles.headerTextColor;
  }
}
