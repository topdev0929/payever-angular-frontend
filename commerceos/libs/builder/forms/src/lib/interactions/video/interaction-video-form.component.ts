import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map, startWith } from 'rxjs/operators';

import { PebInteractionType } from '@pe/builder/core';

import { PebInteractionsFormService } from '..';
import { FormModel } from '../model';

import { PebInteractionVideoFormService } from './interaction-video-form.service';


@Component({
  selector: 'peb-interactions-video-form',
  templateUrl: './interaction-video-form.component.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    '../interactions-form-edit.component.scss',
    './interaction-video-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebInteractionVideoFormComponent {
  form = this.interactionFormService.editForm;
  formValue$ = this.form.valueChanges.pipe(startWith(this.form.value));
  formOptions$ = this.formValue$.pipe(
    map(form => this.getFormOptions(form)),
    startWith({}),
  );

  videoElements$ = this.videoFormService.videoElements$;

  constructor(
    private readonly interactionFormService: PebInteractionsFormService,
    private readonly videoFormService: PebInteractionVideoFormService,
  ) {
  }

  getFormOptions(form: FormModel): FormOptions {
    const isPlay = form.action === PebInteractionType.VideoPlay;
    const isPause = form.action === PebInteractionType.VideoPause;

    return {
      showVideoElements: true,
      showReset: isPlay || isPause,
    };
  }
}

interface FormOptions {
  showVideoElements?: boolean;
  showReset?: boolean;
}
