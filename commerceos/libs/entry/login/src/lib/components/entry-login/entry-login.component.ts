import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnInit,
} from '@angular/core';

import { PeDestroyService } from '@pe/common';

import { BaseEntryLoginComponent } from '../base-entry-login.component';

@Component({
  selector: 'entry-login',
  templateUrl: './entry-login.component.html',
  styleUrls: ['./entry-login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class EntryLoginComponent extends BaseEntryLoginComponent implements OnChanges, OnInit {

  redirectSignUpUrl(): void {
    this.isLoading$.next(false);
    this.router.navigate(['/registration']);
  }

  navigateAfterSocialLogin(path: string): void {
    this.router.navigate([path]);
  }
}
