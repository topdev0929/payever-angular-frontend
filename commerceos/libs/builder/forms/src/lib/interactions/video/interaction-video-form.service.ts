import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import {
  PebInteraction,
  PebVideoInteractionBase,
  isVideo,
} from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';
import { PebElementsState } from '@pe/builder/state';

import { elementToOption } from '../../form.utils';
import { FormModel, VideoFormModel } from '../model';

import { videoInitValue } from '.';


@Injectable()
export class PebInteractionVideoFormService {
  @Select(PebElementsState.allElements) private readonly elements$!: Observable<PebElement[]>;

  videoElements$ = this.elements$.pipe(
    filter(elements => !!elements),
    map(elements => elements
      .filter(elm => !!elm.name && isVideo(elm.styles.fill))
      .map(elementToOption)
    ),
    map(values => [{ name: '-Self-', value: '' }, ...values]),
  );

  constructor(
    private readonly formBuilder: FormBuilder,
  ) {
  }

  buildForm(): FormGroup {
    return this.formBuilder.group({
      ...videoInitValue,
    });
  }

  toVideoForm(interaction: PebInteraction): VideoFormModel {
    const init = videoInitValue;
    const form = interaction as PebVideoInteractionBase;

    return {
      videoElementId: form.videoELementId ?? init.videoElementId,
      reset: form.reset ?? init.reset,
    };
  }

  toInteraction(form: FormModel): PebVideoInteractionBase {
    return {
      type: form.action,
      trigger: form.trigger,
      videoELementId: form.video.videoElementId,
      reset: form.video.reset,
    };
  }
}
