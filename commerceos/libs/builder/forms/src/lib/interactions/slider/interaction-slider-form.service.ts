import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import {
  PebInteraction,
  PebSlidesInteractionBase,
} from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';
import { PebElementsState } from '@pe/builder/state';

import { elementToOption } from '../../form.utils';
import { FormModel, SliderFormModel } from '../model';

import { sliderInitValue } from '.';


@Injectable()
export class PebInteractionSliderFormService {
  @Select(PebElementsState.allElements) private readonly elements$!: Observable<PebElement[]>;

  placeholderElements$ = this.elements$.pipe(
    filter(elements => !!elements),
    map(elements => elements
      .filter(elm => !!elm.name)
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
      ...sliderInitValue,
      contentElement: this.formBuilder.group(sliderInitValue.contentElement),
      slideAnimation: this.formBuilder.group(sliderInitValue.slideAnimation),
      slideAlign: this.formBuilder.group(sliderInitValue.slideAlign),
      autoPlay: this.formBuilder.group(sliderInitValue.autoPlay),
    });
  }

  toSliderForm(interaction: PebInteraction): SliderFormModel {
    const init = sliderInitValue;
    const slide = interaction as PebSlidesInteractionBase;

    return {
      contentElement: { ...init.contentElement, ...slide.content },
      placeholderElementId: slide.placeholder?.elementId ?? '',
      slideType: slide.slide?.type ?? init.slideType,
      slideNumber: slide.slide?.number ?? init.slideNumber,
      slideLoop: slide.slide?.loop ?? init.slideLoop,
      slideAnimation: {
        duration: slide.animation?.duration ?? init.slideAnimation.duration,
        timing: slide.animation?.timing ?? init.slideAnimation.timing,
        delay: slide.animation?.delay ?? init.slideAnimation.delay,
      },
      slideAlign: {
        horizontal: slide.align?.horizontal ?? init.slideAlign.horizontal,
        vertical: slide.align?.vertical ?? init.slideAlign.vertical,
      },
      autoPlay: {
        onLoad: slide.autoPlay?.onLoad ?? init.autoPlay.onLoad,
        duration: slide.autoPlay?.duration ?? init.autoPlay.duration,
        loop: slide.autoPlay?.loop ?? init.autoPlay.loop,        
      },
    };
  }

  toInteraction(form: FormModel): PebSlidesInteractionBase {
    return {
      type: form.action,
      trigger: form.trigger,
      content: form.slider.contentElement,
      placeholder: { elementId: form.slider.placeholderElementId },
      slide: {
        type: form.slider.slideType,
        number: form.slider.slideNumber,
        loop: form.slider.slideLoop,
      },
      animation: form.slider.slideAnimation,
      align: form.slider.slideAlign,
      autoPlay: form.slider.autoPlay,
    };
  }
}
