import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessInterface } from '@pe/business';
import { TranslateService } from '@pe/i18n-core';
import { PeUser, BusinessState } from '@pe/user';
import { WallpaperService } from '@pe/wallpaper';
import { WindowService } from '@pe/window';


@Component({
  selector: 'base-dashboard',
  templateUrl: './base-dashboard.component.html',
  styleUrls: ['./base-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseDashboardComponent {
  @Input() loaded = false;
  @Input() user: PeUser;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  @Output() dockerItemsChange: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() profileButtonClicked: EventEmitter<void> = new EventEmitter<void>();

  isMobile$ = this.windowService.isMobile$;

  greetingVariant: number = Math.floor(Math.random() * 4) + 1;

  constructor(
    private windowService: WindowService,
    private wallpaperService: WallpaperService,
    private translateService: TranslateService,
  ) { }

  get greeting1() {
    return 'greeting.welcome';
  }

  get greeting2() {
    return `greeting.variant_${this.greetingVariant}`;
  }

  get userName() {
    return this.user.firstName || this.user.lastName || '';
  }

  getTranslates() {
    const industry = `greeting.variant.${this.businessData.industry}`;
    const greetingVariant = `greeting.variant_${this.greetingVariant}`;

    return this.translateService.hasTranslation(industry)
      ? `${this.translateService.translate(`greeting.variant_industry`)}
          ${this.translateService.translate(industry)}`
      : this.translateService.translate(greetingVariant);
  }
}
