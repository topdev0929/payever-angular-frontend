import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnInit,
} from '@angular/core';

import { PeDestroyService } from '@pe/common';

import { BaseEntryLoginComponent } from '../../base-entry-login.component';

@Component({
  selector: 'plugin-login',
  templateUrl: './plugin-login.component.html',
  styleUrls: ['./plugin-login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PluginLoginComponent extends BaseEntryLoginComponent implements OnChanges, OnInit {
  private plugin = this.route.snapshot.params['plugin'];

  redirectSignUpUrl(): void {
    const { industry, plugin } = this.route.snapshot.params;
    const queryParams = this.route.snapshot.queryParams;
    this.router.navigate(['registration', industry, plugin], { queryParams });
  }

  navigateAfterSocialLogin(path: string): void {
    this.router.navigate([`switcher`], { queryParams: {  plugin: this.plugin } });
  }
}
