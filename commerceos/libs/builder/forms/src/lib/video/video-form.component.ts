import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PeDestroyService } from '@pe/common';

import { PebBackgroundFormService } from '../background';


@Component({
  selector: 'peb-video-form',
  templateUrl: './video-form.component.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './video-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebVideoFormComponent {

  videoForm = this.backgroundFormService.backgroundForm.controls.video;

  constructor(
    private readonly backgroundFormService: PebBackgroundFormService,
  ) {
  }

  submit() {
    this.backgroundFormService.submit$.next(true);
  }

}
