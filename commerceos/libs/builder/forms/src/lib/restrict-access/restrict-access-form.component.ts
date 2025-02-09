import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PebSideBarService } from '@pe/builder/services';

import { PebRestrictAccessForm } from './restrict-access.form';

@Component({
  selector: 'peb-restrict-access-form',
  templateUrl: './restrict-access-form.component.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './restrict-access-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebRestrictAccessFormComponent {

  constructor(
    private sideBarService: PebSideBarService,
  ) {
  }

  openForm(): void {
    this.sideBarService.openDetail(PebRestrictAccessForm, { backTitle: 'Page', title: 'Restrict Access' });
  }
}
