import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { LogoAlignmentType } from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';

import { HeaderSettings } from '../../../models';

@Component({
  selector: 'pe-layout-header',
  templateUrl: './layout-header-kit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
  .business-header {
    display: flex;
    height: 100%;
    align-items: center;
    border-color: var(--checkout-business-header-border-color, rgba(17, 17, 17, 0.1)) !important;
    background: var(--checkout-business-header-background-color, rgba(17, 17, 17, 0.03)) !important;
  }
  .header-col {
    position: unset;
    display: flex;
    align-items: center;
  }
  .text-right {
    justify-content: flex-end;
  }
  .row {
    display: flex;
    height: 100%;
  }
  .header-cols, .header-wrapper {
    height: inherit;
  }
  `],
})
export class LayoutHeaderKitComponent {

  @Input() settings: HeaderSettings;

  @Input() fullWidth = true;
  @Input() hideLogo = false;

  shouldShowLogoAt(alignment: LogoAlignmentType): boolean {
    const logoAlignment = this.settings?.logo?.alignment || 'left';

    return !this.hideLogo && logoAlignment === alignment;
  }

  constructor(
    protected customElementService: CustomElementService
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['arrow-left-ios-24'],
      null,
      this.customElementService.shadowRoot
    );
  }
}
