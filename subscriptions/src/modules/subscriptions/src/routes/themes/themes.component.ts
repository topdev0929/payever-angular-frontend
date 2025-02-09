import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';

import { AppThemeEnum, EnvService, MessageBus } from '@pe/common';
import { ThemesApi } from '@pe/themes';

import { SubscriptionEnvService } from '../../api/subscription/subscription-env.service';


@Component({
  selector: 'pe-subscriptions-themes',
  templateUrl: './themes.component.html',
  styleUrls: ['./themes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeThemesComponent {
  theme = AppThemeEnum.default;

  constructor(
    private themesApi: ThemesApi,
    private messageBus: MessageBus,
    @Inject(EnvService) private envService: SubscriptionEnvService,
  ) {
    this.themesApi.applicationId = this.envService.applicationId;
  }

  onThemeInstalled() {
    this.messageBus.emit(`subscriptions.navigate.edit`, this.envService.applicationId);
  }
}
