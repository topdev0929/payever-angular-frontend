import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map, startWith } from 'rxjs/operators';

import { PebIndexChangeType, PebInteractionType } from '@pe/builder/core';

import { PebInteractionAnimationFormService, PebInteractionsFormService } from '..';
import * as constants from '../constants';
import { FormModel } from '../model';


@Component({
  selector: 'peb-interactions-animation-form',
  templateUrl: './interaction-animation-form.component.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    '../interactions-form-edit.component.scss',
    './interaction-animation-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebInteractionAnimationFormComponent {
  form = this.interactionFormService.editForm;
  formValue$ = this.form.valueChanges.pipe(startWith(this.form.value));
  formOptions$ = this.formValue$.pipe(map(form => this.getFormOptions(form)));
  placeholderElements$ = this.animationFormService.animationElements$;
  indexChangeTypes = constants.indexChangeTypes;

  constructor(
    private readonly interactionFormService: PebInteractionsFormService,
    private readonly animationFormService: PebInteractionAnimationFormService,
  ) {
  }

  getFormOptions(form: FormModel): FormOptions {
    const isKeyframe = form.action === PebInteractionType.AnimationKeyframe;
    const isNumber = form.animation.keyframeChange?.type === PebIndexChangeType.Number;
    const isNext = form.animation.keyframeChange?.type === PebIndexChangeType.Next;
    const isPrev = form.animation.keyframeChange?.type === PebIndexChangeType.Prev;

    return {
      showKeyframeChange: isKeyframe,
      showKeyframeChangeType: isKeyframe,
      showKeyframeNumber: isKeyframe && isNumber,
      showKeyframeLoop: isKeyframe && (isNext || isPrev),
    };
  }
}

interface FormOptions {
  showKeyframeChange?: boolean;
  showKeyframeChangeType?: boolean;
  showKeyframeNumber?: boolean;
  showKeyframeLoop?: boolean;
}
