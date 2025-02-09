import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import {
  PebAnimationInteractionBase,
  PebInteraction,
  isAnimationKeyframeInteraction,
  isAnimationPlayInteraction,
} from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';
import { PebElementsState } from '@pe/builder/state';

import { elementToOption } from '../../form.utils';
import { AnimationFormModel, FormModel } from '../model';

import { animationInitValue } from '.';


@Injectable()
export class PebInteractionAnimationFormService {
  @Select(PebElementsState.allElements) private readonly elements$!: Observable<PebElement[]>;

  animationElements$ = this.elements$.pipe(
    filter(elements => !!elements),
    map(elements => elements
      .filter(elm => elm.name && elm.animations && Object.keys(elm.animations).length > 0)
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
      ...animationInitValue,
      keyframeChange: this.formBuilder.group({
        ...animationInitValue.keyframeChange,
      }),
    });
  }

  toAnimationForm(interaction: PebInteraction): AnimationFormModel {
    const init = animationInitValue;

    if (isAnimationPlayInteraction(interaction) || isAnimationKeyframeInteraction(interaction)) {
      return {
        customTiming: interaction.customTiming ?? false,
        duration: interaction.duration ?? init.duration,
        keyframeChange: interaction.keyframeChange ?? init.keyframeChange,
        timing: interaction.timing ?? init.timing,
      };
    }

    return init;
  }

  toInteraction(form: FormModel): PebAnimationInteractionBase {
    const animation = form.animation;

    return {
      type: form.action,
      customTiming: animation.customTiming,
      keyframeChange: animation.keyframeChange,
      placeholder: { elementId: form.placeholderElementId },
      trigger: form.trigger,
      duration: animation.duration,
      timing: animation.timing,
    };
  }
}
